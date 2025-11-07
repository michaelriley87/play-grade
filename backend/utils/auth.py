from functools import wraps
from flask import request, jsonify, current_app
import jwt


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Authorization token is missing"}), 401
        try:
            token = (
                token.replace("Bearer ", "") if token.startswith("Bearer ") else token
            )
            decoded = jwt.decode(
                token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
            )
            return f(decoded, *args, **kwargs)
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

    return decorated


def token_optional(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return f(None, *args, **kwargs)  # Guest user
        try:
            token = (
                token.replace("Bearer ", "") if token.startswith("Bearer ") else token
            )
            decoded = jwt.decode(
                token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
            )
            return f(decoded, *args, **kwargs)
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

    return decorated
