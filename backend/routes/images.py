from flask import jsonify, send_from_directory


def images(app):
    # Serve uploaded images
    @app.route("/uploads/<path:filename>", methods=["GET"])
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
            return send_from_directory(
                app.config["UPLOAD_FOLDER"], filename, as_attachment=False
            )
        except FileNotFoundError:
            return jsonify({"error": "File not found"}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
