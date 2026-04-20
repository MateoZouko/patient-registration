import io
import os
import pytest
from PIL import Image
from unittest.mock import MagicMock, patch, call


def make_jpeg_bytes() -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (10, 10), color=(255, 0, 0)).save(buf, format="JPEG")
    buf.seek(0)
    return buf.read()


def make_png_bytes() -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", (10, 10), color=(0, 0, 255)).save(buf, format="PNG")
    buf.seek(0)
    return buf.read()


def _mock_cursor(rows=None):
    cur = MagicMock()
    cur.__enter__ = MagicMock(return_value=cur)
    cur.__exit__ = MagicMock(return_value=False)
    cur.fetchall.return_value = rows or []
    cur.fetchone.return_value = {
        "id": 1,
        "full_name": "Jane Doe",
        "email": "patient@gmail.com",
        "phone_code": "+598",
        "phone_number": "99123456",
        "photo_path": "/uploads/test.jpg",
        "created_at": "2026-01-01T00:00:00+00:00",
    }
    return cur


def _mock_conn(cursor=None):
    conn = MagicMock()
    conn.cursor.return_value = cursor or _mock_cursor()
    return conn


@pytest.fixture
def app(tmp_path):
    with patch("app.database.init_db"), \
         patch("app.database.get_connection", return_value=_mock_conn()):
        os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost/test")
        from app import create_app
        flask_app = create_app()
        flask_app.config["TESTING"] = True
        flask_app.config["UPLOAD_FOLDER"] = str(tmp_path)
        yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.get_json() == {"status": "ok"}


# ---------------------------------------------------------------------------
# GET /api/patients
# ---------------------------------------------------------------------------

def test_list_patients_empty(client):
    with patch("app.routes.get_connection", return_value=_mock_conn(_mock_cursor(rows=[]))):
        res = client.get("/api/patients")
    assert res.status_code == 200
    assert res.get_json() == []


def test_list_patients_returns_records(client):
    row = {
        "id": 1,
        "full_name": "Jane Doe",
        "email": "patient@gmail.com",
        "phone_code": "+598",
        "phone_number": "99123456",
        "photo_path": "/uploads/test.jpg",
        "created_at": "2026-01-01T00:00:00+00:00",
    }
    cur = _mock_cursor(rows=[row])
    with patch("app.routes.get_connection", return_value=_mock_conn(cur)):
        res = client.get("/api/patients")
    data = res.get_json()
    assert res.status_code == 200
    assert len(data) == 1
    assert data[0]["email"] == "patient@gmail.com"


# ---------------------------------------------------------------------------
# POST /api/patients — validation failures (no DB hit needed)
# ---------------------------------------------------------------------------

def _valid_form(**overrides):
    data = {
        "full_name": "Jane Doe",
        "email": "patient@gmail.com",
        "phone_code": "+598",
        "phone_number": "99123456",
    }
    data.update(overrides)
    return data


def test_create_patient_missing_all_fields(client):
    res = client.post("/api/patients", data={})
    assert res.status_code == 422
    errors = res.get_json()["errors"]
    assert "full_name" in errors
    assert "email" in errors
    assert "phone_code" in errors
    assert "phone_number" in errors
    assert "photo" in errors


def test_create_patient_invalid_name(client):
    data = _valid_form(full_name="John2 Doe")
    jpeg = make_jpeg_bytes()
    res = client.post("/api/patients", data={**data, "photo": (io.BytesIO(jpeg), "doc.jpg")},
                      content_type="multipart/form-data")
    assert res.status_code == 422
    assert "full_name" in res.get_json()["errors"]


def test_create_patient_invalid_email(client):
    data = _valid_form(email="user@yahoo.com")
    jpeg = make_jpeg_bytes()
    res = client.post("/api/patients", data={**data, "photo": (io.BytesIO(jpeg), "doc.jpg")},
                      content_type="multipart/form-data")
    assert res.status_code == 422
    assert "email" in res.get_json()["errors"]


def test_create_patient_png_rejected(client):
    png = make_png_bytes()
    res = client.post("/api/patients",
                      data={**_valid_form(), "photo": (io.BytesIO(png), "doc.png")},
                      content_type="multipart/form-data")
    assert res.status_code == 422
    assert "photo" in res.get_json()["errors"]


def test_create_patient_fake_jpg_rejected(client):
    """A PNG renamed to .jpg must fail the Pillow MIME check."""
    png = make_png_bytes()
    res = client.post("/api/patients",
                      data={**_valid_form(), "photo": (io.BytesIO(png), "doc.jpg")},
                      content_type="multipart/form-data")
    assert res.status_code == 422
    assert "photo" in res.get_json()["errors"]


# ---------------------------------------------------------------------------
# POST /api/patients — success
# ---------------------------------------------------------------------------

def test_create_patient_success(client):
    jpeg = make_jpeg_bytes()
    cur = _mock_cursor()
    with patch("app.routes.get_connection", return_value=_mock_conn(cur)), \
         patch("app.routes.send_confirmation_async"):
        res = client.post(
            "/api/patients",
            data={**_valid_form(), "photo": (io.BytesIO(jpeg), "doc.jpg")},
            content_type="multipart/form-data",
        )
    assert res.status_code == 201
    body = res.get_json()
    assert body["email"] == "patient@gmail.com"
    assert "id" in body


def test_create_patient_sends_email(client):
    jpeg = make_jpeg_bytes()
    with patch("app.routes.get_connection", return_value=_mock_conn()), \
         patch("app.routes.send_confirmation_async") as mock_mail:
        client.post(
            "/api/patients",
            data={**_valid_form(), "photo": (io.BytesIO(jpeg), "doc.jpg")},
            content_type="multipart/form-data",
        )
    mock_mail.assert_called_once()
    args = mock_mail.call_args[0]
    assert args[0] == "patient@gmail.com"


# ---------------------------------------------------------------------------
# POST /api/patients — duplicate email
# ---------------------------------------------------------------------------

def test_create_patient_duplicate_email(client):
    jpeg = make_jpeg_bytes()
    conn = _mock_conn()
    conn.cursor.return_value.__enter__.return_value.execute.side_effect = Exception(
        'duplicate key value violates unique constraint "patients_email_key"'
    )
    with patch("app.routes.get_connection", return_value=conn):
        res = client.post(
            "/api/patients",
            data={**_valid_form(), "photo": (io.BytesIO(jpeg), "doc.jpg")},
            content_type="multipart/form-data",
        )
    assert res.status_code == 409
    assert "email" in res.get_json()["errors"]
