
from datetime import datetime, timedelta, timezone
from bcrypt import checkpw, hashpw, gensalt
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify, send_from_directory
from flasgger import Swagger
from flask_cors import CORS
from functools import wraps
import psycopg2
import jwt
import os
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'action_comedy_crime_thriller'
app.config['UPLOAD_FOLDER'] = './uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
CORS(app)

swagger = Swagger(app, template={
    "swagger": "2.0",
    "info": {
        "title": "Play Grade API",
        "description": "API documentation for Play Grade",
        "version": "1.0.0"
    },
    "host": "127.0.0.1:5000",
    "basePath": "/",
    "schemes": ["http"],
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "Enter 'Bearer <JWT>'"
        }
    }
})

DB_CONFIG = {
    'dbname': 'play_grade',
    'user': 'postgres',
    'password': 'postgres',
    'host': 'localhost'
}

# Connect to the database
def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

# Decode JWT and enforce authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Authorization token is missing"}), 401
        try:
            token = token.replace("Bearer ", "") if token.startswith("Bearer ") else token
            decoded = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            return f(decoded, *args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
    return decorated

# Serve uploaded images
@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_uploaded_file(filename):
    """
    Serve an uploaded file.
    ---
    tags:
      - Files
    description: This endpoint serves a file from the uploads directory based on the provided filename. If the file is not found, a 404 error is returned.
    parameters:
      - name: filename
        in: path
        required: true
        description: The name of the file to retrieve from the uploads folder.
        schema:
          type: string
          example: "sample.jpg"
    responses:
      200:
        description: File served successfully.
        content:
          application/octet-stream:
            schema:
              type: string
              format: binary
        headers:
          Content-Type:
            description: The MIME type of the served file.
            schema:
              type: string
              example: "image/jpeg"
      404:
        description: File not found.
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: string
                  example: "File not found"
      500:
        description: Internal server error.
        content:
          application/json:
            schema:
              type: object
              properties:
                error:
                  type: string
                  example: "Internal server error occurred."
    """
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=False)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Register new user
@app.route('/users/register', methods=['POST'])
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
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Check if username or email already exists
        cur.execute("SELECT username, email FROM users WHERE username = %s OR email = %s", (username, email))
        result = cur.fetchone()
        if result:
            if result['username'] == username:
                return jsonify({"error": "Username already exists"}), 400
            if result['email'] == email:
                return jsonify({"error": "Email already exists"}), 400

        # Hash password using salt
        hashed_password = hashpw(password.encode('utf-8'), gensalt())

        # Insert new user
        cur.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING user_id",
            (username, email, hashed_password.decode('utf-8'))
        )
        user_id = cur.fetchone()['user_id']
        conn.commit()

        return jsonify({"message": "User registered successfully", "user_id": user_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# Login user
@app.route('/users/login', methods=['POST'])
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
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Fetch user by email
        cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cur.fetchone()

        if not user or not checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({"error": "Invalid email or password"}), 400

        # Create JWT token
        token = jwt.encode(
            {
                "user_id": user['user_id'],
                "username": user['username'],
                "is_admin": user['is_admin'],
                "exp": datetime.now(timezone.utc) + timedelta(days=30)
            },
            app.config['SECRET_KEY'],
            algorithm="HS256"
        )

        return jsonify({"message": "Login successful", "token": token}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# Delete user account
@app.route('/users/<int:user_id>', methods=['DELETE'])
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
  current_user_id = decoded_token['user_id']
  is_admin = decoded_token['is_admin']

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

# Create new post
@app.route('/posts', methods=['POST'])
@token_required
def create_post(decoded_token):
    """
    Create a new post (Requires Authorization).
    ---
    tags:
      - Posts
    description: This endpoint allows a logged-in user to create a new post. The user must provide a valid Bearer token in the Authorization header. Posts must include a category, title, and body with a maximum of 300 characters.
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
    user_id = decoded_token['user_id']

    # Parse form data
    title = request.form.get('title')
    body = request.form.get('body')
    category = request.form.get('category')
    file = request.files.get('image') 
    category_mapping = {'🎮 Games': 'G', '🎥 Film/TV': 'F', '🎵 Music': 'M'}
    category = category_mapping.get(category)

    # Validate required fields
    if not title or not body or not category:
        return jsonify({"error": "Title, body, and category are required"}), 400
    if len(body) > 300:
        return jsonify({"error": "Body must not exceed 300 characters"}), 400
    if category not in ['G', 'F', 'M']:
        return jsonify({"error": "Invalid category. Must be 'G', 'F', or 'M'"}), 400

    # Handle file upload
    image_url = None
    if file:
        if '.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}:
            # Generate a unique filename
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            # Save the file
            file.save(filepath)
            image_url = f"/uploads/{unique_filename}"
        else:
            return jsonify({"error": "Invalid file type. Allowed: png, jpg, jpeg, gif"}), 400

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
            (user_id, title, body, category, image_url)
        )
        post_id = cur.fetchone()['post_id']
        conn.commit()

        # Return success message and post_id
        return jsonify({"message": "Post created successfully", "post_id": post_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# Delete post
@app.route('/posts/<int:post_id>', methods=['DELETE'])
@token_required
def delete_post(decoded_token, post_id):
    """
    Delete a post (Requires Authorization).
    ---
    tags:
      - Posts
    description:
        Allows a poster or Admin to delete a post.
    parameters:
      - name: post_id
        in: path
        required: true
        schema:
          type: integer
        description: ID of the post to delete.
    responses:
      200:
        description: Post deleted successfully.
      403:
        description: You are not authorized to delete this post.
      404:
        description: Post not found.
      500:
        description: Server error.
    security:
      - Bearer: []
    """
    user_id = decoded_token['user_id']
    is_admin = decoded_token['is_admin']

    try:
        # Ensure the post exists
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT poster_id FROM posts WHERE post_id = %s", (post_id,))
        post = cur.fetchone()

        if not post:
            return jsonify({"error": "Post not found"}), 404

        # Check if the user is allowed to delete the post
        if not (post['poster_id'] == user_id or is_admin):
            return jsonify({"error": "You are not authorized to delete this post"}), 403

        # Delete the post
        cur.execute("DELETE FROM posts WHERE post_id = %s", (post_id,))
        conn.commit()

        return jsonify({"message": "Post deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# Get a single post by post_id
@app.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """
    Retrieve a single post by its ID.
    ---
    tags:
      - Posts
    description: This endpoint retrieves a single post by its unique ID.
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
        description: Post retrieved successfully.
        content:
          application/json:
            schema:
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
      404:
        description: Post not found.
      500:
        description: Server error.
    """
    try:
        # SQL query to fetch a single post by post_id
        query = """
            SELECT post_id, poster_id, title, category, body, image_url, like_count, reply_count, created_at
            FROM posts
            WHERE post_id = %s
        """

        # Execute the query
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(query, (post_id,))
        post = cur.fetchone()

        # Check if the post exists
        if post is None:
            return jsonify({"error": "Post not found"}), 404

        return jsonify(post), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# Get multiple posts using query parameters
@app.route('/posts', methods=['GET'])
def get_posts():
    """
    Retrieve posts with optional filters.
    ---
    tags:
      - Posts
    description: This endpoint retrieves posts based on filters such as categories, users, age range, and search queries. Posts can also be sorted by newest, most liked, or most commented.
    parameters:
      - name: categories
        in: query
        required: false
        description: Filter posts by categories.
        schema:
          type: array
          items:
            type: string
          example: ["🎮 Games", "🎥 Film/TV, 🎵 Music"]
      - name: users
        in: query
        required: false
        description: Filter by user type (All Users or Followed Users).
        schema:
          type: string
          enum: ["All Users", "Followed Users"]
          example: "Followed Users"
      - name: ageRange
        in: query
        required: false
        description: Filter posts by age range.
        schema:
          type: string
          enum: ["Today", "Week", "Month", "Year", "All"]
          example: "Week"
      - name: sortBy
        in: query
        required: false
        description: Sort posts by criteria.
        schema:
          type: string
          enum: ["Newest", "Most Liked", "Most Comments"]
          example: "Most Liked"
      - name: searchQuery
        in: query
        required: false
        description: Search posts by title or body.
        schema:
          type: string
          example: "example search term"
    responses:
      200:
        description: Posts retrieved successfully.
      400:
        description: Invalid input.
      500:
        description: Server error.
    """
    try:
        # Parse query parameters
        category_mapping = { "🎮 Games": "G", "🎥 Film/TV": "F", "🎵 Music": "M" }
        raw_categories = request.args.get('categories', '')  # Fetch as a single string
        categories = [cat.strip() for cat in raw_categories.split(',') if cat.strip()]  # Split and clean categories
        categories = [category_mapping.get(cat) for cat in categories if category_mapping.get(cat)] # Map categories to backend-friendly codes

        users = request.args.get('users', 'All Users')
        age_range = request.args.get('ageRange', 'All')
        sort_by = request.args.get('sortBy', 'Newest')
        search_query = request.args.get('searchQuery', '')

        # Start building the SQL query
        query = """
            SELECT post_id, poster_id, title, category, body, image_url, like_count, reply_count, created_at
            FROM posts
            WHERE 1=1
        """
        params = []

        # Filter by categories
        if categories:
            placeholders = ', '.join(['%s'] * len(categories))
            query += f" AND category IN ({placeholders})"
            params.extend(categories)

        # Filter by user type
        if users == 'Followed Users':
            followed_user_ids = [1, 2, 3]  # Example hardcoded values
            query += " AND poster_id = ANY(%s)"
            params.append(followed_user_ids)

        # Filter by age range
        if age_range != 'All':
            time_intervals = {
                'Today': '1 day',
                'Week': '7 days',
                'Month': '30 days',
                'Year': '365 days'
            }
            if age_range in time_intervals:
                query += " AND created_at >= NOW() - INTERVAL %s"
                params.append(time_intervals[age_range])

        # Filter by search query
        if search_query:
            query += " AND (LOWER(title) LIKE %s OR LOWER(body) LIKE %s)"
            search_term = f"%{search_query.lower()}%"
            params.extend([search_term, search_term])

        # Sorting
        sort_columns = {
            'Newest': 'created_at DESC',
            'Most Liked': 'like_count DESC',
            'Most Comments': 'reply_count DESC'
        }
        query += f" ORDER BY {sort_columns.get(sort_by, 'created_at DESC')}"

        # Execute the query
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(query, tuple(params))
        posts = cur.fetchall()

        return jsonify(posts), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()


# Like post or comment
@app.route('/likes', methods=['POST'])
@token_required
def like(decoded_token):
    """
    Like a post or reply (Requires Authorization).
    ---
    tags:
      - Likes
    description:
        Allows a logged-in user to like a post or reply. A valid Bearer token must be included in the Authorization header.
    parameters:
      - name: body
        in: body
        required: true
        description: Details of the like.
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
        description: Like added successfully.
      400:
        description: Invalid input or like already exists.
      401:
        description: Authorization token is missing or invalid.
      500:
        description: Server error.
    security:
      - Bearer: []
    """
    user_id = decoded_token['user_id']
    data = request.json

    target_id = data.get('target_id')
    target_type = data.get('type')

    # Validate input
    if not target_id or target_type not in ['post', 'reply']:
        return jsonify({"error": "Invalid input"}), 400

    # Determine which table to reference
    column = 'post_id' if target_type == 'post' else 'reply_id'

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Check if the target exists
        table = 'posts' if target_type == 'post' else 'replies'
        cur.execute(f"SELECT 1 FROM {table} WHERE {column} = %s", (target_id,))
        if not cur.fetchone():
            return jsonify({"error": f"{target_type.capitalize()} not found"}), 404

        # Check if the like already exists
        cur.execute(
            "SELECT 1 FROM likes WHERE user_id = %s AND post_id = %s AND reply_id IS NULL" if target_type == 'post' else
            "SELECT 1 FROM likes WHERE user_id = %s AND reply_id = %s AND post_id IS NULL",
            (user_id, target_id)
        )
        if cur.fetchone():
            return jsonify({"error": "Like already exists"}), 400

        # Add the like
        cur.execute(
            "INSERT INTO likes (user_id, post_id, reply_id) VALUES (%s, %s, %s)",
            (user_id, target_id if target_type == 'post' else None, target_id if target_type == 'reply' else None)
        )
        conn.commit()
        return jsonify({"message": "Like added successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# Unlike post or comment
@app.route('/likes', methods=['DELETE'])
@token_required
def unlike(decoded_token):
    """
    Unlike a post or reply (Requires Authorization).
    ---
    tags:
      - Likes
    description:
        Allows a logged-in user to remove a like from a post or reply. A valid Bearer token must be included in the Authorization header.
    parameters:
      - name: body
        in: body
        required: true
        description: Details of the unlike.
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
        description: Like removed successfully.
      400:
        description: Invalid input or like does not exist.
      401:
        description: Authorization token is missing or invalid.
      500:
        description: Server error.
    security:
      - Bearer: []
    """
    user_id = decoded_token['user_id']
    data = request.json

    target_id = data.get('target_id')
    target_type = data.get('type')

    # Validate input
    if not target_id or target_type not in ['post', 'reply']:
        return jsonify({"error": "Invalid input"}), 400

    # Determine which column to reference
    column = 'post_id' if target_type == 'post' else 'reply_id'

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Check if the like exists
        cur.execute(
            "SELECT 1 FROM likes WHERE user_id = %s AND post_id = %s AND reply_id IS NULL" if target_type == 'post' else
            "SELECT 1 FROM likes WHERE user_id = %s AND reply_id = %s AND post_id IS NULL",
            (user_id, target_id)
        )
        if not cur.fetchone():
            return jsonify({"error": "Like does not exist"}), 400

        # Remove the like
        cur.execute(
            "DELETE FROM likes WHERE user_id = %s AND post_id = %s AND reply_id IS NULL" if target_type == 'post' else
            "DELETE FROM likes WHERE user_id = %s AND reply_id = %s AND post_id IS NULL",
            (user_id, target_id)
        )
        conn.commit()
        return jsonify({"message": "Like removed successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()
        
@app.route('/follows', methods=['POST'])
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
    follower_id = decoded_token['user_id']
    data = request.json
    followee_id = data.get('followee_id')

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
            (follower_id, followee_id)
        )
        if cur.fetchone():
            return jsonify({"error": "You are already following this user"}), 400

        # Create the follow relationship
        cur.execute(
            "INSERT INTO follows (follower_id, followee_id) VALUES (%s, %s)",
            (follower_id, followee_id)
        )
        conn.commit()
        return jsonify({"message": "Follow created successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

@app.route('/follows', methods=['DELETE'])
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
    follower_id = decoded_token['user_id']
    data = request.json
    followee_id = data.get('followee_id')

    if not followee_id:
        return jsonify({"error": "Followee ID is required"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Check if the follow relationship exists
        cur.execute(
            "SELECT 1 FROM follows WHERE follower_id = %s AND followee_id = %s",
            (follower_id, followee_id)
        )
        if not cur.fetchone():
            return jsonify({"error": "You are not following this user"}), 400

        # Delete the follow relationship
        cur.execute(
            "DELETE FROM follows WHERE follower_id = %s AND followee_id = %s",
            (follower_id, followee_id)
        )
        conn.commit()
        return jsonify({"message": "Unfollowed successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# Create reply to post
@app.route('/replies', methods=['POST'])
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
    parameters:
      - name: body
        in: body
        required: true
        description: Reply details.
        schema:
          type: object
          required:
            - post_id
            - body
          properties:
            post_id:
              type: integer
              description: ID of the post to reply to.
              example: 123
            body:
              type: string
              maxLength: 300
              description: The content of the reply.
              example: "I completely agree with your review!"
            image_url:
              type: string
              description: Optional URL for an image in the reply.
              example: "/path/to/image.jpg"
    responses:
      201:
        description: Reply created successfully.
      400:
        description: Invalid input.
      401:
        description: Authorization token is missing or invalid.
      404:
        description: Post not found.
      500:
        description: Server error.
    security:
      - Bearer: []
    """
    user_id = decoded_token['user_id']
    data = request.json

    post_id = data.get('post_id')
    body = data.get('body')
    image_url = data.get('image_url')  # Optional

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

        # Insert the reply
        cur.execute(
            """
            INSERT INTO replies (post_id, replier_id, body, image_url)
            VALUES (%s, %s, %s, %s)
            RETURNING reply_id
            """,
            (post_id, user_id, body, image_url)
        )
        reply_id = cur.fetchone()['reply_id']
        conn.commit()

        return jsonify({"message": "Reply created successfully", "reply_id": reply_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

# Delete reply to post
@app.route('/replies/<int:reply_id>', methods=['DELETE'])
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
    user_id = decoded_token['user_id']
    is_admin = decoded_token['is_admin']

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Check if the reply exists
        cur.execute("SELECT replier_id FROM replies WHERE reply_id = %s", (reply_id,))
        reply = cur.fetchone()

        if not reply:
            return jsonify({"error": "Reply not found"}), 404

        # Check permissions
        if reply['replier_id'] != user_id and not is_admin:
            return jsonify({"error": "Unauthorized action"}), 403

        # Delete the reply
        cur.execute("DELETE FROM replies WHERE reply_id = %s", (reply_id,))
        conn.commit()

        return jsonify({"message": "Reply deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True)
