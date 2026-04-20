# Patient Registration

A full-stack application for registering patients. Built with Python/Flask (backend) and React + TypeScript (frontend), backed by PostgreSQL, containerised with Docker.

## Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python 3.11, Flask 3, psycopg2-binary |
| Frontend  | React 19, TypeScript, Vite          |
| Database  | PostgreSQL 15                       |
| Email     | SMTP (Mailtrap for development)     |
| Container | Docker + Docker Compose             |

---

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

### 1. Clone the repository

```bash
git clone <repository-url>
cd patient-registration
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Mailtrap credentials:

```
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
```

You can obtain free Mailtrap credentials at [mailtrap.io](https://mailtrap.io).

> Email delivery is optional — the app works without it. Failed sends are logged silently and do not affect the response.

### 3. Start all services

```bash
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:5000      |

The database schema is created automatically on first startup.

---

## Running Tests

Tests run inside the backend container (no local Python environment required).

```bash
# Install test dependencies inside the container (first time only)
docker compose exec backend pip install pytest pytest-mock

# Run all tests
docker compose exec backend python -m pytest tests/ -v
```

**42 tests** covering:

| Suite | Tests |
|---|---|
| `test_validators.py` | Every validation rule — name (letters only, accents, length), email (@gmail.com), country code (+N format), phone number (4–15 digits), photo extension |
| `test_routes.py` | Health check, patient listing, successful registration, field validation errors, PNG renamed to .jpg rejected by Pillow, duplicate email (409), async email dispatch |

To run a specific file:

```bash
docker compose exec backend python -m pytest tests/test_validators.py -v
docker compose exec backend python -m pytest tests/test_routes.py -v
```

---

## API Endpoints

### `GET /api/patients`

Returns all registered patients ordered by registration date (newest first).

**Response `200`**
```json
[
  {
    "id": 1,
    "full_name": "Jane Doe",
    "email": "jane@gmail.com",
    "phone_code": "+598",
    "phone_number": "99123456",
    "photo_path": "/uploads/uuid.jpg",
    "created_at": "2026-01-15T10:30:00+00:00"
  }
]
```

---

### `POST /api/patients`

Registers a new patient. Expects `multipart/form-data`.

| Field          | Type   | Rules                                          |
|----------------|--------|------------------------------------------------|
| `full_name`    | string | Required, letters only (accents allowed)       |
| `email`        | string | Required, unique, `@gmail.com` only            |
| `phone_code`   | string | Required, format: `+1` to `+9999`             |
| `phone_number` | string | Required, 4–15 digits                          |
| `photo`        | file   | Required, JPG/JPEG only (MIME verified), max 5 MB |

**Response `201`** — the created patient object.

**Response `422`** — validation errors:
```json
{
  "errors": {
    "email": "Email must be a valid @gmail.com address."
  }
}
```

**Response `409`** — duplicate email.

**Response `413`** — file exceeds the 5 MB limit.

---

### `GET /api/uploads/<filename>`

Serves uploaded document photos.

---

### `GET /api/health`

Health check. Returns `{"status": "ok"}`.

---

## Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt          # production deps
pip install -r requirements-dev.txt      # adds pytest + pytest-mock

export DATABASE_URL=postgresql://patients_user:patients_pass@localhost:5432/patients_db
python run.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> **Note for browsers with MetaMask or similar extensions:** The frontend uses `import type` for all TypeScript interfaces to prevent SES (Secure ECMAScript) environments from throwing runtime errors on type-only module imports.

---

## Project Structure

```
patient-registration/
├── backend/
│   ├── app/
│   │   ├── __init__.py      # Flask factory, 413 error handler
│   │   ├── database.py      # DB connection & schema init (raw SQL)
│   │   ├── routes.py        # API endpoints, Pillow MIME verification
│   │   ├── validators.py    # Server-side field validation
│   │   └── mailer.py        # Async email via daemon thread
│   ├── tests/
│   │   ├── test_validators.py  # 31 unit tests
│   │   └── test_routes.py      # 11 integration tests
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── api/             # API client (fetch + error handling)
│   │   ├── components/      # All UI components (no UI libraries)
│   │   ├── hooks/           # usePatients (useReducer-based)
│   │   ├── styles/          # Global CSS + design tokens
│   │   └── types/           # TypeScript interfaces
│   ├── Dockerfile
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Frontend Validation Rules

| Field          | Rule                                                       |
|----------------|------------------------------------------------------------|
| Full name      | Letters (including accented), spaces, hyphens, apostrophes |
| Email          | Must end in `@gmail.com`                                   |
| Country code   | `+` followed by 1–4 digits (e.g. `+598`)                  |
| Phone number   | 4–15 digits                                                |
| Document photo | Drag-and-drop or click, JPG only, max 5 MB                 |

Errors appear below each field with a slide-down animation, shown only after the first submit attempt and then re-validated on every keystroke.

After submission, a modal displays:
- **Success** — green icon with `popIn` animation, confirmation message
- **Error** — red icon with `shake` animation, specific error message
