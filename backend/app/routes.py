import io
import os
import uuid
from flask import Blueprint, jsonify, request, current_app
from PIL import Image, UnidentifiedImageError

from .database import get_connection
from .validators import validate_patient
from .notifier import send_confirmation_async

patients_bp = Blueprint("patients", __name__, url_prefix="/api")


def _verify_jpeg(file_storage) -> bool:
    try:
        content = file_storage.read()
        file_storage.seek(0)
        img = Image.open(io.BytesIO(content))
        return img.format == "JPEG"
    except Exception:
        return False


@patients_bp.route("/patients", methods=["GET"])
def list_patients():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, full_name, email, phone_code, phone_number, photo_path, created_at
                FROM patients
                ORDER BY created_at DESC
                """
            )
            rows = cur.fetchall()
        return jsonify([dict(r) for r in rows]), 200
    finally:
        conn.close()


@patients_bp.route("/patients", methods=["POST"])
def create_patient():
    form_data = request.form.to_dict()
    photo_file = request.files.get("photo")
    photo_filename = photo_file.filename if photo_file else None

    errors = validate_patient(form_data, photo_filename)
    if errors:
        return jsonify({"errors": errors}), 422

    if not _verify_jpeg(photo_file):
        return jsonify({"errors": {"photo": "The file must be a valid JPEG image."}}), 422

    ext = os.path.splitext(photo_filename)[1].lower()
    unique_name = f"{uuid.uuid4()}{ext}"
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    save_path = os.path.join(upload_folder, unique_name)
    photo_file.save(save_path)

    relative_path = f"/api/uploads/{unique_name}"
    email = form_data["email"].strip().lower()

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO patients (full_name, email, phone_code, phone_number, photo_path)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, full_name, email, phone_code, phone_number, photo_path, created_at
                """,
                (
                    form_data["full_name"].strip(),
                    email,
                    form_data["phone_code"].strip(),
                    form_data["phone_number"].strip(),
                    relative_path,
                ),
            )
            new_patient = dict(cur.fetchone())
        conn.commit()
    except Exception as exc:
        conn.rollback()
        if "unique" in str(exc).lower() and "email" in str(exc).lower():
            return jsonify({"errors": {"email": "This email address is already registered."}}), 409
        return jsonify({"errors": {"general": "An unexpected error occurred. Please try again."}}), 500
    finally:
        conn.close()

    send_confirmation_async(email, new_patient["full_name"])

    return jsonify(new_patient), 201


@patients_bp.route("/uploads/<path:filename>", methods=["GET"])
def serve_upload(filename: str):
    from flask import send_from_directory
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    return send_from_directory(upload_folder, filename)


@patients_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200
