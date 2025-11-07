from flask import jsonify, request
from psycopg2.extras import RealDictCursor
import os

from utils.database import get_db_connection
from utils.auth import token_required


def replies(app):
    # Create reply to post
    @app.route("/replies", methods=["POST"])
    @token_required
    def create_reply(decoded_token):
        """
        Create a reply to a post (Requires Authorization).
        ---
        tags:
        - Replies
        description:
            Allows a logged-in user to create a reply for a specific post.
            A valid Bearer token must be included in the Authorization header.
        consumes:
        - multipart/form-data
        parameters:
        - name: post_id
            in: formData
            required: true
            type: integer
            description: ID of the post to reply to.
        - name: body
            in: formData
            required: true
            type: string
            maxLength: 300
            description: The content of the reply (max 300 characters).
        - name: image_url
            in: formData
            required: false
            type: file
            description: Optional image file for the reply.
        responses:
        201:
            description: Reply created successfully.
            schema:
            type: object
            properties:
                message:
                type: string
                example: "Reply created successfully"
                reply_id:
                type: integer
                example: 123
        400:
            description: Invalid input (missing post_id or body, or body exceeds 300 characters).
            schema:
            type: object
            properties:
                error:
                type: string
                example: "Post ID and body are required"
        401:
            description: Authorization token is missing or invalid.
        404:
            description: Post not found.
        500:
            description: Server error.
        security:
        - Bearer: []
        """
        user_id = decoded_token["user_id"]

        # Parse form data
        post_id = request.form.get("post_id")
        body = request.form.get("body")
        image = request.files.get("image_url")  # Optional

        # Validate required fields
        if not post_id or not body:
            return jsonify({"error": "Post ID and body are required"}), 400
        if len(body) > 300:
            return jsonify({"error": "Reply body must not exceed 300 characters"}), 400

        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Check if the post exists
            cur.execute("SELECT 1 FROM posts WHERE post_id = %s", (post_id,))
            if not cur.fetchone():
                return jsonify({"error": "Post not found"}), 404

            # Handle the image file (optional)
            image_url = None
            if image:
                # Save the file and get its path (customize this)
                image_url = f"/uploads/{image.filename}"
                image.save(f"./uploads/{image.filename}")

            # Insert the reply
            cur.execute(
                """
                INSERT INTO replies (post_id, replier_id, body, image_url)
                VALUES (%s, %s, %s, %s)
                RETURNING reply_id
                """,
                (post_id, user_id, body, image_url),
            )
            reply_id = cur.fetchone()["reply_id"]

            # Increment the reply count for the related post
            cur.execute(
                """
                UPDATE posts
                SET reply_count = reply_count + 1
                WHERE post_id = %s
                """,
                (post_id,),
            )

            conn.commit()

            return (
                jsonify(
                    {"message": "Reply created successfully", "reply_id": reply_id}
                ),
                201,
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()

    # Delete reply to post
    @app.route("/replies/<int:reply_id>", methods=["DELETE"])
    @token_required
    def delete_reply(decoded_token, reply_id):
        """
        Delete a reply (Requires Authorization).
        ---
        tags:
        - Replies
        description:
            Allows a user to delete their own reply, or an admin to delete any reply.
            A valid Bearer token must be included in the Authorization header.
        parameters:
        - name: reply_id
            in: path
            required: true
            type: integer
            description: ID of the reply to delete.
        responses:
        200:
            description: Reply deleted successfully.
        403:
            description: Unauthorized action.
        404:
            description: Reply not found.
        500:
            description: Server error.
        security:
        - Bearer: []
        """
        user_id = decoded_token["user_id"]
        is_admin = decoded_token["is_admin"]

        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Check if the reply exists
            cur.execute(
                "SELECT post_id, replier_id, image_url FROM replies WHERE reply_id = %s",
                (reply_id,),
            )
            reply = cur.fetchone()

            if not reply:
                return jsonify({"error": "Reply not found"}), 404

            post_id = reply["post_id"]

            # Check permissions
            if reply["replier_id"] != user_id and not is_admin:
                return jsonify({"error": "Unauthorized action"}), 403

            # Delete the image file if it exists
            image_url = reply.get("image_url")
            if image_url:
                absolute_path = os.path.join(
                    app.config["UPLOAD_FOLDER"], os.path.basename(image_url)
                )
                if os.path.exists(absolute_path):
                    os.remove(absolute_path)

            # Delete the reply
            cur.execute("DELETE FROM replies WHERE reply_id = %s", (reply_id,))

            # Decrement the reply count for the related post
            cur.execute(
                """
                UPDATE posts
                SET reply_count = reply_count - 1
                WHERE post_id = %s AND reply_count > 0
                """,
                (post_id,),
            )

            conn.commit()

            return (
                jsonify({"message": "Reply and associated image deleted successfully"}),
                200,
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()
