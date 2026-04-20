import re
from typing import Any


_NAME_RE = re.compile(r"^[A-Za-zÀ-ÿ\s\-']+$")
_EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@gmail\.com$")
_PHONE_CODE_RE = re.compile(r"^\+\d{1,4}$")
_PHONE_NUM_RE = re.compile(r"^\d{4,15}$")


def validate_patient(data: dict[str, Any], photo_filename: str | None) -> dict[str, str]:
    errors: dict[str, str] = {}

    full_name = (data.get("full_name") or "").strip()
    if not full_name:
        errors["full_name"] = "Full name is required."
    elif not _NAME_RE.match(full_name):
        errors["full_name"] = "Full name must contain letters only."
    elif len(full_name) > 255:
        errors["full_name"] = "Full name must be at most 255 characters."

    email = (data.get("email") or "").strip().lower()
    if not email:
        errors["email"] = "Email address is required."
    elif not _EMAIL_RE.match(email):
        errors["email"] = "Email must be a valid @gmail.com address."

    phone_code = (data.get("phone_code") or "").strip()
    if not phone_code:
        errors["phone_code"] = "Country code is required."
    elif not _PHONE_CODE_RE.match(phone_code):
        errors["phone_code"] = "Country code must start with + followed by digits (e.g. +598)."

    phone_number = (data.get("phone_number") or "").strip()
    if not phone_number:
        errors["phone_number"] = "Phone number is required."
    elif not _PHONE_NUM_RE.match(phone_number):
        errors["phone_number"] = "Phone number must contain 4–15 digits."

    if photo_filename is None:
        errors["photo"] = "Document photo is required."
    elif not photo_filename.lower().endswith(".jpg") and not photo_filename.lower().endswith(".jpeg"):
        errors["photo"] = "Document photo must be a JPG/JPEG file."

    return errors
