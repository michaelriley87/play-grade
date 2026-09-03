from flask import Flask, jsonify
from flasgger import Swagger
from flask_cors import CORS
import os

# Import route modules
from routes.users import users
from routes.posts import posts
from routes.replies import replies
from routes.likes import likes
from routes.follows import follows
from routes.images import images

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("PLAYGRADE_SECRET_KEY")
if not app.config["SECRET_KEY"]:
    raise RuntimeError("PLAYGRADE_SECRET_KEY must be set")

app.config["UPLOAD_FOLDER"] = os.path.abspath(
    os.getenv("PLAYGRADE_UPLOAD_FOLDER", os.path.join(os.path.dirname(__file__), "uploads"))
)
app.config["MAX_CONTENT_LENGTH"] = int(
    os.getenv("PLAYGRADE_MAX_UPLOAD_BYTES", str(2 * 1024 * 1024))
)
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
cors_origins = os.getenv("PLAYGRADE_CORS_ORIGINS", "http://localhost:3000").split(",")
CORS(app, origins=[origin.strip() for origin in cors_origins if origin.strip()])

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


@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "false").lower() in {"1", "true", "yes"}
    app.run(debug=debug)
