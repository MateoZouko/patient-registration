import pytest
from app.validators import validate_patient


def valid_data(**overrides):
    base = {
        "full_name": "Jane Doe",
        "email": "patient@gmail.com",
        "phone_code": "+598",
        "phone_number": "99123456",
    }
    base.update(overrides)
    return base


# ---------------------------------------------------------------------------
# full_name
# ---------------------------------------------------------------------------

def test_valid_full_name():
    assert "full_name" not in validate_patient(valid_data(), "photo.jpg")


def test_full_name_missing():
    errors = validate_patient(valid_data(full_name=""), "photo.jpg")
    assert "full_name" in errors


def test_full_name_with_digits():
    errors = validate_patient(valid_data(full_name="John2 Doe"), "photo.jpg")
    assert "full_name" in errors


def test_full_name_accented_letters_allowed():
    assert "full_name" not in validate_patient(valid_data(full_name="José García"), "photo.jpg")


def test_full_name_hyphen_allowed():
    assert "full_name" not in validate_patient(valid_data(full_name="Mary-Jane"), "photo.jpg")


def test_full_name_too_long():
    errors = validate_patient(valid_data(full_name="A" * 256), "photo.jpg")
    assert "full_name" in errors


# ---------------------------------------------------------------------------
# email
# ---------------------------------------------------------------------------

def test_valid_email():
    assert "email" not in validate_patient(valid_data(), "photo.jpg")


def test_email_missing():
    errors = validate_patient(valid_data(email=""), "photo.jpg")
    assert "email" in errors


def test_email_not_gmail():
    errors = validate_patient(valid_data(email="user@yahoo.com"), "photo.jpg")
    assert "email" in errors


def test_email_no_at_sign():
    errors = validate_patient(valid_data(email="usergmail.com"), "photo.jpg")
    assert "email" in errors


def test_email_subdomain_rejected():
    errors = validate_patient(valid_data(email="user@mail.gmail.com"), "photo.jpg")
    assert "email" in errors


# ---------------------------------------------------------------------------
# phone_code
# ---------------------------------------------------------------------------

def test_valid_phone_code():
    assert "phone_code" not in validate_patient(valid_data(), "photo.jpg")


def test_phone_code_missing():
    errors = validate_patient(valid_data(phone_code=""), "photo.jpg")
    assert "phone_code" in errors


def test_phone_code_no_plus():
    errors = validate_patient(valid_data(phone_code="598"), "photo.jpg")
    assert "phone_code" in errors


def test_phone_code_letters_rejected():
    errors = validate_patient(valid_data(phone_code="+ABC"), "photo.jpg")
    assert "phone_code" in errors


def test_phone_code_max_four_digits():
    assert "phone_code" not in validate_patient(valid_data(phone_code="+1234"), "photo.jpg")


def test_phone_code_five_digits_rejected():
    errors = validate_patient(valid_data(phone_code="+12345"), "photo.jpg")
    assert "phone_code" in errors


# ---------------------------------------------------------------------------
# phone_number
# ---------------------------------------------------------------------------

def test_valid_phone_number():
    assert "phone_number" not in validate_patient(valid_data(), "photo.jpg")


def test_phone_number_missing():
    errors = validate_patient(valid_data(phone_number=""), "photo.jpg")
    assert "phone_number" in errors


def test_phone_number_too_short():
    errors = validate_patient(valid_data(phone_number="123"), "photo.jpg")
    assert "phone_number" in errors


def test_phone_number_letters_rejected():
    errors = validate_patient(valid_data(phone_number="9912abcd"), "photo.jpg")
    assert "phone_number" in errors


def test_phone_number_max_fifteen_digits():
    assert "phone_number" not in validate_patient(valid_data(phone_number="1" * 15), "photo.jpg")


def test_phone_number_sixteen_digits_rejected():
    errors = validate_patient(valid_data(phone_number="1" * 16), "photo.jpg")
    assert "phone_number" in errors


# ---------------------------------------------------------------------------
# photo
# ---------------------------------------------------------------------------

def test_photo_missing():
    errors = validate_patient(valid_data(), None)
    assert "photo" in errors


def test_photo_jpg_accepted():
    assert "photo" not in validate_patient(valid_data(), "document.jpg")


def test_photo_jpeg_accepted():
    assert "photo" not in validate_patient(valid_data(), "document.jpeg")


def test_photo_png_rejected():
    errors = validate_patient(valid_data(), "document.png")
    assert "photo" in errors


def test_photo_pdf_rejected():
    errors = validate_patient(valid_data(), "document.pdf")
    assert "photo" in errors


def test_photo_uppercase_jpg_accepted():
    assert "photo" not in validate_patient(valid_data(), "DOCUMENT.JPG")


# ---------------------------------------------------------------------------
# multiple errors returned at once
# ---------------------------------------------------------------------------

def test_multiple_errors_returned():
    errors = validate_patient({"full_name": "", "email": "", "phone_code": "", "phone_number": ""}, None)
    assert len(errors) == 5


def test_no_errors_on_valid_data():
    assert validate_patient(valid_data(), "photo.jpg") == {}
