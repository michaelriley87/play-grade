from bcrypt import checkpw, hashpw, gensalt
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify, send_from_directory
from flasgger import Swagger
from flask_cors import CORS
import os
import uuid

# Import helper functions
from utils.database import get_db_connection
from utils.auth import token_required, token_optional

# Import route modules
from routes.users import users
from routes.posts import posts
from routes.replies import replies
from routes.likes import likes
from routes.follows import follows
from routes.images import images

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("PLAYGRADE_SECRET_KEY", "default_secret_key")
app.config["UPLOAD_FOLDER"] = "./uploads"
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
CORS(app)

swagger = Swagger(
    app,
    template={
        "swagger": "2.0",
        "info": {
            "title": "Play Grade API",
            "description": "API documentation for Play Grade",
            "version": "1.0.0",
        },
        "host": os.getenv("PLAYGRADE_SWAGGER_HOST", "localhost"),
        "basePath": "/",
        "schemes": ["http"],
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "Enter 'Bearer <JWT>'",
            }
        },
    },
)

# Register route groups
users(app)
posts(app)
replies(app)
likes(app)
follows(app)
images(app)

if __name__ == "__main__":
    app.run(debug=True)
