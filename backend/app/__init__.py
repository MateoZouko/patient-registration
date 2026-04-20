import os
from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import RequestEntityTooLarge

from .database import init_db
from .routes import patients_bp


def create_app() -> Flask:
    app = Flask(__name__)

    app.config["UPLOAD_FOLDER"] = os.environ.get("UPLOAD_FOLDER", "./uploads")
    app.config["MAX_CONTENT_LENGTH"] = int(
        os.environ.get("MAX_CONTENT_LENGTH", 5 * 1024 * 1024)
    )

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    CORS(app, origins="*")

    @app.errorhandler(RequestEntityTooLarge)
    def handle_too_large(_e):
        mb = app.config["MAX_CONTENT_LENGTH"] // (1024 * 1024)
        return jsonify({"errors": {"photo": f"File is too large. Maximum allowed size is {mb} MB."}}), 413

    with app.app_context():
        init_db()

    app.register_blueprint(patients_bp)

    return app
