from flask import jsonify, request
from psycopg2.extras import RealDictCursor
from utils.database import get_db_connection
from utils.auth import token_required, token_optional
import os
from bcrypt import checkpw, hashpw, gensalt
import jwt
import uuid


def users(app):
    # Register new user
    @app.route("/users/register", methods=["POST"])
    def register():
        """
        Register a new user
        ---
        tags:
        - Users
        description:
            This endpoint allows a new user to create an account. The user must provide a unique username, a
            unique valid email address, and a password. The password will be securely hashed before storage.
        parameters:
        - name: body
            in: body
            required: true
            description: User registration details
            schema:
            type: object
            required:
                - username
                - email
                - password
            properties:
                username:
                type: string
                example: testuser
                email:
                type: string
                example: test@example.com
                password:
                type: string
                example: securepassword
        responses:
        201:
            description: User registered successfully
            schema:
            type: object
            properties:
                message:
                type: string
                example: User registered successfully
                user_id:
                type: integer
                example: 1
        400:
            description: Invalid input or duplicate user
            schema:
            type: object
            properties:
                error:
                type: string
                example: Username already exists
        500:
            description: Server error
            schema:
            type: object
            properties:
                error:
                type: string
                example: Internal server error
        """
        data = request.json
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if not username or not email or not password:
            return jsonify({"error": "All fields are required"}), 400

        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Check if username or email already exists
            cur.execute(
                "SELECT username, email FROM users WHERE username = %s OR email = %s",
                (username, email),
            )
            result = cur.fetchone()
            if result:
                if result["username"] == username:
                    return jsonify({"error": "Username already exists"}), 400
                if result["email"] == email:
                    return jsonify({"error": "Email already exists"}), 400

            # Hash password using salt
            hashed_password = hashpw(password.encode("utf-8"), gensalt())

            # Insert new user
            cur.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING user_id",
                (username, email, hashed_password.decode("utf-8")),
            )
            user_id = cur.fetchone()["user_id"]
            conn.commit()

            return (
                jsonify(
                    {"message": "User registered successfully", "user_id": user_id}
                ),
                201,
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()

    # Login user
    @app.route("/users/login", methods=["POST"])
    def login():
        """
        User login
        ---
        tags:
        - Users
        description:
            This endpoint authenticates a user by verifying their email and password. On success, it returns a JWT token that
            must be included in the Authorization header for subsequent requests. Tokens are valid for 30 days by default.
        parameters:
        - name: body
            in: body
            required: true
            description: User login details
            schema:
            type: object
            required:
                - email
                - password
            properties:
                email:
                type: string
                example: test@example.com
                password:
                type: string
                example: securepassword
        responses:
        200:
            description: Login successful
            schema:
            type: object
            properties:
                token:
                type: string
                example: <JWT token>
        400:
            description: Invalid credentials
            schema:
            type: object
            properties:
                error:
                type: string
                example: Invalid email or password
        """
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Fetch user by email
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cur.fetchone()

            if not user or not checkpw(
                password.encode("utf-8"), user["password_hash"].encode("utf-8")
            ):
                return jsonify({"error": "Invalid email or password"}), 400

            # Create JWT token
            token = jwt.encode(
                {"user_id": user["user_id"], "is_admin": user["is_admin"]},
                app.config["SECRET_KEY"],
                algorithm="HS256",
            )

            return jsonify({"message": "Login successful", "token": token}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()

    # Get user details
    @app.route("/users/<int:user_id>", methods=["GET"])
    @token_optional  # Allows logged-in users but supports guests
    def get_user(current_user, user_id):
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Query user details
            cur.execute(
                "SELECT user_id, username, profile_picture FROM users WHERE user_id = %s",
                (user_id,),
            )
            user = cur.fetchone()

            if not user:
                return jsonify({"error": "User not found"}), 404

            # Default value for is_following
            is_following = False

            # If authenticated, check if following
            if current_user:
                cur.execute(
                    "SELECT 1 FROM follows WHERE follower_id = %s AND followee_id = %s",
                    (current_user["user_id"], user_id),
                )
                is_following = cur.fetchone() is not None

            return (
                jsonify(
                    {
                        "user_id": user["user_id"],
                        "username": user["username"],
                        "profile_picture": user.get("profile_picture", None),
                        "is_following": is_following,
                    }
                ),
                200,
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()

    # Update user profile picture
    @app.route("/users/<int:user_id>/profile-picture", methods=["PATCH"])
    @token_required
    def update_display_picture(decoded_token, user_id):
        """
        Update a user's display picture (Requires Authorization).
        ---
        tags:
        - Users
        description:
        This endpoint allows a user to update their display picture by uploading an image file.
        The user must provide a valid Bearer token in the Authorization header.
        parameters:
        - name: user_id
            in: path
            required: true
            type: integer
            description: ID of the user whose display picture is being updated.
        - name: image
            in: formData
            required: true
            type: file
            description: New profile picture file (png, jpg, jpeg, gif).
        responses:
        200:
            description: Display picture updated successfully.
        400:
            description: Invalid request (e.g., missing file, unsupported format).
        403:
            description: Unauthorized action.
        404:
            description: User not found.
        500:
            description: Server error.
        security:
        - Bearer: []
        """
        current_user_id = decoded_token["user_id"]
        is_admin = decoded_token["is_admin"]
        conn = None
        cur = None

        try:
            file = request.files.get("image")
            if not file:
                return jsonify({"error": "Image file is required"}), 400

            # Validate file type
            allowed_extensions = {"png", "jpg", "jpeg", "gif"}
            if (
                "." not in file.filename
                or file.filename.rsplit(".", 1)[1].lower() not in allowed_extensions
            ):
                return (
                    jsonify(
                        {"error": "Invalid file type. Allowed: png, jpg, jpeg, gif"}
                    ),
                    400,
                )

            file_extension = file.filename.rsplit(".", 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
            file.save(filepath)
            profile_picture_url = f"/uploads/{unique_filename}"

            # Initialize DB connection
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Ensure user exists
            cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
            user = cur.fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404

            # Check permissions
            if current_user_id != user_id and not is_admin:
                return jsonify({"error": "Unauthorized action"}), 403

            # Update profile picture
            cur.execute(
                "UPDATE users SET profile_picture = %s WHERE user_id = %s",
                (profile_picture_url, user_id),
            )
            conn.commit()

            return (
                jsonify(
                    {
                        "message": "Profile picture updated successfully",
                        "profile_picture": profile_picture_url,
                    }
                ),
                200,
            )

        except Exception as e:
            if conn:
                conn.rollback()
            return jsonify({"error": str(e)}), 500

        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()

    # Update username
    @app.route("/users/<int:user_id>/username", methods=["PATCH"])
    @token_required
    def update_username(decoded_token, user_id):
        """
        Update a user's username (Requires Authorization).
        ---
        tags:
        - Users
        description:
        This endpoint allows a user to update their username.
        The user must provide a valid Bearer token in the Authorization header.
        parameters:
        - name: user_id
            in: path
            required: true
            type: integer
            description: ID of the user whose username is being updated.
        - name: body
            in: body
            required: true
            schema:
            type: object
            properties:
                username:
                type: string
                description: New username (must be unique).
                example: "new_username"
        responses:
        200:
            description: Username updated successfully.
        400:
            description: Invalid request (e.g., missing username, already taken).
        403:
            description: Unauthorized action.
        404:
            description: User not found.
        500:
            description: Server error.
        security:
        - Bearer: []
        """
        current_user_id = decoded_token["user_id"]
        is_admin = decoded_token["is_admin"]

        try:
            data = request.get_json()
            new_username = data.get("username")

            if not new_username:
                return jsonify({"error": "Missing username field"}), 400

            # Ensure username is unique
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("SELECT * FROM users WHERE username = %s", (new_username,))
            existing_user = cur.fetchone()

            if existing_user:
                return jsonify({"error": "Username is already taken"}), 400

            # Ensure user exists
            cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
            user = cur.fetchone()

            if not user:
                return jsonify({"error": "User not found"}), 404

            # Check permissions
            if current_user_id != user_id and not is_admin:
                return jsonify({"error": "Unauthorized action"}), 403

            # Update username
            cur.execute(
                "UPDATE users SET username = %s WHERE user_id = %s",
                (new_username, user_id),
            )
            conn.commit()

            return (
                jsonify(
                    {
                        "message": "Username updated successfully",
                        "username": new_username,
                    }
                ),
                200,
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            if cur:
                cur.close()
            if conn:
                conn.close()

    # Update user password
    @app.route("/users/<int:user_id>/password", methods=["PATCH"])
    @token_required
    def update_password(decoded_token, user_id):
        """
        Update a user's password (Requires Authorization).
        ---
        tags:
        - Users
        description:
        This endpoint allows a user to update their password.
        The user must provide their current password for verification.
        The new password will be securely hashed before being stored.
        parameters:
        - name: user_id
            in: path
            required: true
            type: integer
            description: ID of the user whose password is being updated.
        - name: body
            in: body
            required: true
            schema:
            type: object
            required:
                - current_password
                - new_password
            properties:
                current_password:
                type: string
                example: "oldpassword123"
                new_password:
                type: string
                example: "NewSecurePassword456"
        responses:
        200:
            description: Password updated successfully.
        400:
            description: Invalid request (e.g., missing fields).
        401:
            description: Incorrect current password.
        403:
            description: Unauthorized action.
        404:
            description: User not found.
        500:
            description: Server error.
        security:
        - Bearer: []
        """
        current_user_id = decoded_token["user_id"]
        is_admin = decoded_token["is_admin"]

        data = request.json
        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not current_password or not new_password:
            return (
                jsonify(
                    {"error": "Both current_password and new_password are required"}
                ),
                400,
            )

        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Fetch user
            cur.execute(
                "SELECT password_hash FROM users WHERE user_id = %s", (user_id,)
            )
            user = cur.fetchone()

            if not user:
                return jsonify({"error": "User not found"}), 404

            # Check permissions
            if current_user_id != user_id and not is_admin:
                return jsonify({"error": "Unauthorized action"}), 403

            # Verify current password
            if not checkpw(
                current_password.encode("utf-8"), user["password_hash"].encode("utf-8")
            ):
                return jsonify({"error": "Incorrect current password"}), 401

            # Hash the new password
            hashed_password = hashpw(new_password.encode("utf-8"), gensalt()).decode(
                "utf-8"
            )

            # Update password in the database
            cur.execute(
                "UPDATE users SET password_hash = %s WHERE user_id = %s",
                (hashed_password, user_id),
            )
            conn.commit()

            return jsonify({"message": "Password updated successfully"}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()

    # Delete user account
    @app.route("/users/<int:user_id>", methods=["DELETE"])
    @token_required
    def delete_user(decoded_token, user_id):
        """
        Delete a user account (Requires Authorization).
        ---
        tags:
            - Users
        description:
            Requires a valid Bearer token in the `Authorization` header. Users can delete their own account. Admins can delete any account.
        parameters:
            - name: user_id
            in: path
            required: true
            type: integer
            description: ID of the user to delete
        responses:
            200:
            description: User account deleted successfully.
            403:
            description: Unauthorized action.
            404:
            description: User not found.
            500:
            description: Server error
        security:
            - Bearer: []
        """
        current_user_id = decoded_token["user_id"]
        is_admin = decoded_token["is_admin"]

        try:
            # Ensure user exists
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
            user = cur.fetchone()

            if not user:
                return jsonify({"error": "User not found"}), 404

            # Check permissions
            if current_user_id != user_id and not is_admin:
                return jsonify({"error": "Unauthorized action"}), 403

            # Delete user
            try:
                cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
                conn.commit()
            except Exception as e:
                conn.rollback()
                return jsonify({"error": str(e)}), 500

            return jsonify({"message": "User account deleted successfully"}), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()
