from flask import jsonify, request
from psycopg2.extras import RealDictCursor
from utils.database import get_db_connection
from utils.auth import token_required, token_optional
import os
import uuid


def posts(app):
    # Create new post
    @app.route("/posts", methods=["POST"])
    @token_required
    def create_post(decoded_token):
        """
        Create a new post (Requires Authorization).
        ---
        tags:
        - Posts
        description: This endpoint allows a logged-in user to create a new post. The user must provide a valid Bearer token in the Authorization header. Posts must include a category, title, body with a maximum of 300 characters, and an image file.
        parameters:
        - name: body
            in: body
            required: true
            description: Post details.
            schema:
            type: object
            required:
                - title
                - body
                - category
                - image_url
            properties:
                title:
                type: string
                example: "My Favorite Movie"
                body:
                type: string
                maxLength: 300
                example: "I absolutely love this movie because..."
                category:
                type: string
                enum: ["G", "F", "M"]
                example: "F"
                image_url:
                type: string
                example: "/path/to/image.jpg"
        responses:
        201:
            description: Post created successfully.
        400:
            description: Invalid input.
        401:
            description: Authorization token is missing or invalid.
        500:
            description: Server error.
        security:
        - Bearer: []
        """
        user_id = decoded_token["user_id"]

        # Parse form data
        title = request.form.get("title")
        body = request.form.get("body")
        category = request.form.get("category")
        file = request.files.get("image")
        category_mapping = {"🎮 Games": "G", "🎥 Film/TV": "F", "🎵 Music": "M"}
        category = category_mapping.get(category)

        # Validate required fields
        if not title or not body or not category:
            return jsonify({"error": "Title, body, and category are required"}), 400
        if len(body) > 300:
            return jsonify({"error": "Body must not exceed 300 characters"}), 400
        if category not in ["G", "F", "M"]:
            return jsonify({"error": "Invalid category. Must be 'G', 'F', or 'M'"}), 400
        if not file:
            return jsonify({"error": "Image file is required"}), 400

        # Validate file type
        if "." in file.filename and file.filename.rsplit(".", 1)[1].lower() in {
            "png",
            "jpg",
            "jpeg",
            "gif",
        }:
            # Generate a unique filename
            file_extension = file.filename.rsplit(".", 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], unique_filename)
            # Save the file
            file.save(filepath)
            image_url = f"/uploads/{unique_filename}"
        else:
            return (
                jsonify({"error": "Invalid file type. Allowed: png, jpg, jpeg, gif"}),
                400,
            )

        try:
            # Insert the post into the database
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute(
                """
                INSERT INTO posts (poster_id, title, body, category, image_url)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING post_id
                """,
                (user_id, title, body, category, image_url),
            )
            post_id = cur.fetchone()["post_id"]
            conn.commit()

            # Return success message and post_id
            return (
                jsonify({"message": "Post created successfully", "post_id": post_id}),
                201,
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()

    # Delete post
    @app.route("/posts/<int:post_id>", methods=["DELETE"])
    @token_required
    def delete_post(decoded_token, post_id):
        """
        Delete a post (Requires Authorization).
        ---
        tags:
        - Posts
        description:
            Allows a poster or Admin to delete a post along with its associated image file.
        parameters:
        - name: post_id
            in: path
            required: true
            schema:
            type: integer
            description: ID of the post to delete.
            example: 42
        responses:
        200:
            description: Post deleted successfully.
        403:
            description: You are not authorized to delete this post.
        404:
            description: Post not found.
        500:
            description: An unexpected server error occurred.
        security:
        - Bearer: []
        """
        user_id = decoded_token["user_id"]
        is_admin = decoded_token["is_admin"]

        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute(
                "SELECT poster_id, image_url FROM posts WHERE post_id = %s", (post_id,)
            )
            post = cur.fetchone()

            if not post:
                return jsonify({"error": "Post not found"}), 404

            if not (post["poster_id"] == user_id or is_admin):
                return (
                    jsonify({"error": "You are not authorized to delete this post"}),
                    403,
                )

            # Delete the image file
            image_url = post.get("image_url")
            if image_url:
                # Convert relative URL to absolute file path
                absolute_path = os.path.join(
                    app.config["UPLOAD_FOLDER"], os.path.basename(image_url)
                )
                if os.path.exists(absolute_path):
                    os.remove(absolute_path)

            # Delete the post from the database
            cur.execute("DELETE FROM posts WHERE post_id = %s", (post_id,))
            conn.commit()

            return (
                jsonify({"message": "Post and associated image deleted successfully"}),
                200,
            )

        except Exception as e:
            return jsonify({"error": "An unexpected error occurred"}), 500

        finally:
            cur.close()
            conn.close()

    # Get a single post by post_id with replies (optional authentication)
    @app.route("/posts/<int:post_id>", methods=["GET"])
    @token_optional
    def get_post_with_replies(decoded_token, post_id):
        """
        Retrieve a single post by its ID along with its replies.
        ---
        tags:
        - Posts
        description: This endpoint retrieves a single post by its unique ID, including its replies.
                    If authenticated, it will also indicate whether the user has liked the post/replies.
        parameters:
        - name: post_id
            in: path
            required: true
            description: The ID of the post to retrieve.
            schema:
            type: integer
            example: 123
        responses:
        200:
            description: Post and replies retrieved successfully.
            content:
            application/json:
                schema:
                type: object
                properties:
                    post:
                    type: object
                    properties:
                        post_id:
                        type: integer
                        poster_id:
                        type: integer
                        title:
                        type: string
                        category:
                        type: string
                        body:
                        type: string
                        image_url:
                        type: string
                        like_count:
                        type: integer
                        reply_count:
                        type: integer
                        created_at:
                        type: string
                        format: date-time
                        username:
                        type: string
                        profile_picture:
                        type: string
                        liked:
                        type: boolean
                        description: Whether the authenticated user has liked this post.
                    replies:
                    type: array
                    items:
                        type: object
                        properties:
                        reply_id:
                            type: integer
                        post_id:
                            type: integer
                        replier_id:
                            type: integer
                        body:
                            type: string
                        image_url:
                            type: string
                        like_count:
                            type: integer
                        created_at:
                            type: string
                            format: date-time
                        username:
                            type: string
                        profile_picture:
                            type: string
                        liked:
                            type: boolean
                            description: Whether the authenticated user has liked this reply.
        404:
            description: Post not found.
        500:
            description: Server error.
        """
        try:
            user_id = (
                decoded_token["user_id"] if decoded_token else None
            )  # User ID if logged in, otherwise None

            # SQL query to fetch the post with user details
            post_query = """
                SELECT 
                    posts.post_id, 
                    posts.poster_id, 
                    posts.title, 
                    posts.category, 
                    posts.body, 
                    posts.image_url, 
                    posts.like_count, 
                    posts.reply_count, 
                    posts.created_at,
                    users.username, 
                    users.profile_picture,
                    CASE 
                        WHEN likes.user_id IS NOT NULL THEN TRUE 
                        ELSE FALSE 
                    END AS liked
                FROM posts
                JOIN users ON posts.poster_id = users.user_id
                LEFT JOIN likes ON posts.post_id = likes.post_id AND likes.user_id = %s
                WHERE posts.post_id = %s
            """

            # SQL query to fetch replies associated with the post
            replies_query = """
                SELECT 
                    replies.reply_id, 
                    replies.post_id, 
                    replies.replier_id, 
                    replies.body, 
                    replies.image_url, 
                    replies.like_count, 
                    replies.created_at, 
                    users.username, 
                    users.profile_picture,
                    CASE 
                        WHEN likes.user_id IS NOT NULL THEN TRUE 
                        ELSE FALSE 
                    END AS liked
                FROM replies
                JOIN users ON replies.replier_id = users.user_id
                LEFT JOIN likes ON replies.reply_id = likes.reply_id AND likes.user_id = %s
                WHERE replies.post_id = %s
                ORDER BY replies.created_at ASC
            """

            # Execute the queries
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Fetch the post
            cur.execute(post_query, (user_id, post_id))
            post = cur.fetchone()

            # Check if the post exists
            if post is None:
                return jsonify({"error": "Post not found"}), 404

            # Fetch the replies
            cur.execute(replies_query, (user_id, post_id))
            replies = cur.fetchall()

            # Combine the post and replies into a single response
            response = {"post": post, "replies": replies}

            return jsonify(response), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()

    # Get multiple posts using query parameters and pagination
    @app.route("/posts", methods=["GET"])
    @token_optional
    def get_posts(decoded_token):
        """
        Retrieve posts with optional filters, sorting, and pagination
        ---
        tags:
        - Posts
        parameters:
        - in: header
            name: Authorization
            required: false
            description: Optional Bearer token for authentication.
            schema:
            type: string
            example: "Bearer your_token_here"
        - in: query
            name: posterId
            required: false
            description: Filter posts by a specific user's ID.
            schema:
            type: integer
            example: 123
        - in: query
            name: categories
            required: false
            description: Filter posts by categories.
            schema:
            type: array
            items:
                type: string
                enum: ["🎮 Games", "🎥 Film/TV", "🎵 Music"]
            example: ["🎮 Games", "🎥 Film/TV"]
        - in: query
            name: ageRange
            required: false
            description: Filter posts by time period.
            schema:
            type: string
            enum: ["Today", "Week", "Month", "Year", "All"]
            example: "Week"
        - in: query
            name: searchQuery
            required: false
            description: Search posts by title or body.
            schema:
            type: string
            example: "arcade games"
        - in: query
            name: users
            required: false
            description: Filter by All Users or Followed Users.
            schema:
            type: string
            enum: ["All Users", "Followed Users"]
            example: "Followed Users"
        - in: query
            name: sortBy
            required: false
            description: Sort posts by a specific criterion.
            schema:
            type: string
            enum: ["Newest", "Most Liked", "Most Comments"]
            example: "Most Liked"
        - in: query
            name: page
            required: false
            description: Page number for pagination.
            schema:
            type: integer
            example: 1
        - in: query
            name: limit
            required: false
            description: Number of posts per page.
            schema:
            type: integer
            example: 10
        responses:
        200:
            description: Posts retrieved successfully.
        400:
            description: Bad request (e.g., invalid filter values).
        500:
            description: Server error.
        """
        try:
            user_id = decoded_token.get("user_id") if decoded_token else None
            page = int(request.args.get("page", 1))
            limit = int(request.args.get("limit", 10))
            offset = (page - 1) * limit

            sort_by = request.args.get("sortBy", "Newest")
            sort_options = {
                "Newest": "posts.created_at DESC",
                "Most Liked": "posts.like_count DESC, posts.created_at DESC",
                "Most Comments": "posts.reply_count DESC, posts.created_at DESC",
            }
            order_by = sort_options.get(sort_by, "posts.created_at DESC")

            # Base query
            query = """
                SELECT posts.post_id, posts.poster_id, posts.title, posts.category, posts.body, posts.image_url,
                    posts.like_count, posts.reply_count, posts.created_at, users.username, users.profile_picture,
                    CASE WHEN likes.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS liked
                FROM posts
                JOIN users ON posts.poster_id = users.user_id
                LEFT JOIN likes ON posts.post_id = likes.post_id AND likes.user_id = %s
                WHERE 1=1
            """
            count_query = "SELECT COUNT(*) FROM posts WHERE 1=1"
            params = [user_id if user_id else -1]  # Placeholder for likes check
            count_params = []  # Separate list for count query

            # Filter by posterId (User Page)
            poster_id = request.args.get("posterId")
            if poster_id:
                query += " AND posts.poster_id = %s"
                count_query += " AND posts.poster_id = %s"
                params.append(int(poster_id))
                count_params.append(int(poster_id))

            # Filter by categories
            category_map = {"🎮 Games": "G", "🎥 Film/TV": "F", "🎵 Music": "M"}
            requested_categories = request.args.getlist("categories")
            stored_categories = [
                category_map[c] for c in requested_categories if c in category_map
            ]

            if stored_categories:
                query += " AND posts.category = ANY(%s)"
                count_query += " AND posts.category = ANY(%s)"
                params.append(stored_categories)
                count_params.append(stored_categories)

            # Filter by age range
            age_range = request.args.get("ageRange", "All")
            age_filters = {
                "Today": "posts.created_at >= NOW() - INTERVAL '1 day'",
                "Week": "posts.created_at >= NOW() - INTERVAL '7 days'",
                "Month": "posts.created_at >= NOW() - INTERVAL '30 days'",
                "Year": "posts.created_at >= NOW() - INTERVAL '365 days'",
            }
            if age_range in age_filters:
                query += f" AND {age_filters[age_range]}"
                count_query += f" AND {age_filters[age_range]}"

            # Filter by search query (title OR body)
            search_query = request.args.get("searchQuery", "").strip()
            if search_query:
                query += " AND (posts.title ILIKE %s OR posts.body ILIKE %s)"
                count_query += " AND (posts.title ILIKE %s OR posts.body ILIKE %s)"
                params.extend([f"%{search_query}%", f"%{search_query}%"])
                count_params.extend([f"%{search_query}%", f"%{search_query}%"])

            # Filter by Followed Users
            users_filter = request.args.get("users", "All Users")
            if users_filter == "Followed Users" and user_id:
                query += """
                    AND posts.poster_id IN (
                        SELECT followee_id FROM follows WHERE follower_id = %s
                    )
                """
                count_query += """
                    AND posts.poster_id IN (
                        SELECT followee_id FROM follows WHERE follower_id = %s
                    )
                """
                params.append(user_id)
                count_params.append(user_id)

            # Apply sorting and pagination
            query += f" ORDER BY {order_by} LIMIT %s OFFSET %s"
            params.extend([limit, offset])

            # Execute queries
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Get posts
            cur.execute(query, tuple(params))
            posts = cur.fetchall()

            # Get total count
            cur.execute(count_query, tuple(count_params))
            total_posts = cur.fetchone()["count"]
            total_pages = (total_posts + limit - 1) // limit  # Correct page calculation

            return (
                jsonify(
                    {"posts": posts, "totalPages": total_pages, "currentPage": page}
                ),
                200,
            )

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            cur.close()
            conn.close()
