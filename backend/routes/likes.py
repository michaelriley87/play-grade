from flask import jsonify, request
from psycopg2.extras import RealDictCursor
from utils.database import get_db_connection
from utils.auth import token_required


def likes(app):
    # Like a post or reply
    @app.route("/likes", methods=["POST"])
    @token_required
    def like(decoded_token):
        """
        Like a post or reply (Requires Authorization).
        ---
        tags:
        - Likes
        description: |
        Allows a logged-in user to like a post or reply. A valid Bearer token must be included in the Authorization header.
        Also increments the like count in the `posts` table if the target is a post.
        parameters:
        - in: header
            name: Authorization
            required: true
            description: Bearer token for authentication.
            schema:
            type: string
            example: "Bearer your_token_here"
        - in: body
            name: body
            required: true
            description: JSON object containing the like details.
            schema:
            type: object
            required:
                - target_id
                - type
            properties:
                target_id:
                type: integer
                description: ID of the post or reply to like.
                example: 123
                type:
                type: string
                enum: ["post", "reply"]
                description: Indicates whether the target is a post or a reply.
                example: "post"
        responses:
        201:
            description: Like added successfully, and like count updated if applicable.
        400:
            description: Invalid input or like already exists.
        401:
            description: Authorization token is missing or invalid.
        404:
            description: Target post or reply not found.
        500:
            description: Server error.
        security:
        - Bearer: []
        """
        user_id = decoded_token["user_id"]
        data = request.json

        target_id = data.get("target_id")
        target_type = data.get("type")

        if not target_id or target_type not in ["post", "reply"]:
            return jsonify({"error": "Invalid input"}), 400

        column = "post_id" if target_type == "post" else "reply_id"
        table = "posts" if target_type == "post" else "replies"

        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Check if target exists
            cur.execute(f"SELECT 1 FROM {table} WHERE {column} = %s", (target_id,))
            if not cur.fetchone():
                return jsonify({"error": f"{target_type.capitalize()} not found"}), 404

            # Check if like already exists
            cur.execute(
                f"""
                SELECT 1 FROM likes 
                WHERE user_id = %s 
                AND {column} = %s
                """,
                (user_id, target_id),
            )
            if cur.fetchone():
                return jsonify({"error": "Like already exists"}), 400

            # Add like
            cur.execute(
                f"""
                INSERT INTO likes (user_id, {column}) 
                VALUES (%s, %s)
                """,
                (user_id, target_id),
            )

            # Increment like_count for posts or replies
            cur.execute(
                f"UPDATE {table} SET like_count = like_count + 1 WHERE {column} = %s",
                (target_id,),
            )

            conn.commit()
            return jsonify({"message": "Like added successfully"}), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()

    # Unlike a post or reply
    @app.route("/likes", methods=["DELETE"])
    @token_required
    def unlike(decoded_token):
        """
        Unlike a post or reply (Requires Authorization).
        ---
        tags:
        - Likes
        description: |
        Allows a logged-in user to remove a like from a post or reply. A valid Bearer token must be included in the Authorization header.
        Also decrements the like count in the `posts` table if the target is a post.
        parameters:
        - in: header
            name: Authorization
            required: true
            description: Bearer token for authentication.
            schema:
            type: string
            example: "Bearer your_token_here"
        - in: body
            name: body
            required: true
            description: JSON object containing the unlike details.
            schema:
            type: object
            required:
                - target_id
                - type
            properties:
                target_id:
                type: integer
                description: ID of the post or reply to unlike.
                example: 123
                type:
                type: string
                enum: ["post", "reply"]
                description: Indicates whether the target is a post or a reply.
                example: "post"
        responses:
        200:
            description: Like removed successfully, and like count updated if applicable.
        400:
            description: Invalid input or like does not exist.
        401:
            description: Authorization token is missing or invalid.
        404:
            description: Target post or reply not found.
        500:
            description: Server error.
        security:
        - Bearer: []
        """
        user_id = decoded_token["user_id"]
        data = request.json

        target_id = data.get("target_id")
        target_type = data.get("type")

        if not target_id or target_type not in ["post", "reply"]:
            return jsonify({"error": "Invalid input"}), 400

        column = "post_id" if target_type == "post" else "reply_id"
        table = "posts" if target_type == "post" else "replies"

        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Check if like exists
            cur.execute(
                f"""
                SELECT 1 FROM likes 
                WHERE user_id = %s 
                AND {column} = %s
                """,
                (user_id, target_id),
            )
            if not cur.fetchone():
                return jsonify({"error": "Like does not exist"}), 400

            # Remove like
            cur.execute(
                f"""
                DELETE FROM likes 
                WHERE user_id = %s 
                AND {column} = %s
                """,
                (user_id, target_id),
            )

            # Decrement like_count for posts or replies
            cur.execute(
                f"UPDATE {table} SET like_count = GREATEST(like_count - 1, 0) WHERE {column} = %s",
                (target_id,),
            )

            conn.commit()
            return jsonify({"message": "Like removed successfully"}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()
