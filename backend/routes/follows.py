from flask import jsonify, request
from psycopg2.extras import RealDictCursor
from utils.database import get_db_connection
from utils.auth import token_required


def follows(app):
    # Follow a user account
    @app.route("/follows", methods=["POST"])
    @token_required
    def follow(decoded_token):
        """
        Follow a user (Requires Authorization).
        ---
        tags:
        - Follows
        description:
            Allows a logged-in user to follow another user. Users cannot follow themselves.
            A valid Bearer token must be included in the Authorization header.
        parameters:
        - name: body
            in: body
            required: true
            description: Follow details.
            schema:
            type: object
            required:
                - followee_id
            properties:
                followee_id:
                type: integer
                description: ID of the user to follow.
                example: 2
        responses:
        201:
            description: Follow created successfully.
        400:
            description: Invalid input or already following the user or attempting to follow yourself.
        401:
            description: Authorization token is missing or invalid.
        404:
            description: User to follow not found.
        500:
            description: Server error.
        security:
        - Bearer: []
        """
        follower_id = decoded_token["user_id"]
        data = request.json
        followee_id = data.get("followee_id")

        if not followee_id:
            return jsonify({"error": "Followee ID is required"}), 400

        if followee_id == follower_id:
            return jsonify({"error": "You cannot follow yourself"}), 400

        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Check if the followee exists
            cur.execute("SELECT user_id FROM users WHERE user_id = %s", (followee_id,))
            if not cur.fetchone():
                return jsonify({"error": "User to follow not found"}), 404

            # Check if the user is already following
            cur.execute(
                "SELECT 1 FROM follows WHERE follower_id = %s AND followee_id = %s",
                (follower_id, followee_id),
            )
            if cur.fetchone():
                return jsonify({"error": "You are already following this user"}), 400

            # Create the follow relationship
            cur.execute(
                "INSERT INTO follows (follower_id, followee_id) VALUES (%s, %s)",
                (follower_id, followee_id),
            )
            conn.commit()
            return jsonify({"message": "Follow created successfully"}), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()

    # Unfollow a user account
    @app.route("/follows", methods=["DELETE"])
    @token_required
    def unfollow(decoded_token):
        """
        Unfollow a user (Requires Authorization).
        ---
        tags:
        - Follows
        description:
            Allows a logged-in user to unfollow another user. A valid Bearer token must be included in the Authorization header.
        parameters:
        - name: body
            in: body
            required: true
            description: Unfollow details.
            schema:
            type: object
            required:
                - followee_id
            properties:
                followee_id:
                type: integer
                description: ID of the user to unfollow.
                example: 2
        responses:
        200:
            description: Unfollowed successfully.
        400:
            description: Invalid input or not following the user.
        401:
            description: Authorization token is missing or invalid.
        404:
            description: User to unfollow not found.
        500:
            description: Server error.
        security:
        - Bearer: []
        """
        follower_id = decoded_token["user_id"]
        data = request.json
        followee_id = data.get("followee_id")

        if not followee_id:
            return jsonify({"error": "Followee ID is required"}), 400

        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Check if the follow relationship exists
            cur.execute(
                "SELECT 1 FROM follows WHERE follower_id = %s AND followee_id = %s",
                (follower_id, followee_id),
            )
            if not cur.fetchone():
                return jsonify({"error": "You are not following this user"}), 400

            # Delete the follow relationship
            cur.execute(
                "DELETE FROM follows WHERE follower_id = %s AND followee_id = %s",
                (follower_id, followee_id),
            )
            conn.commit()
            return jsonify({"message": "Unfollowed successfully"}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()
