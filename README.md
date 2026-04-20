# Patient Registration

A full-stack application for registering patients. Built with Python/Flask (backend) and React + TypeScript (frontend), backed by PostgreSQL, containerised with Docker.

## Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Python 3.11, Flask 3, psycopg2      |
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

### 3. Start all services

```bash
docker compose up --build
```

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000      |
| Backend  | http://localhost:5000      |
| API docs | See endpoints below        |

The database schema is created automatically on first startup.

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

| Field          | Type   | Rules                               |
|----------------|--------|-------------------------------------|
| `full_name`    | string | Required, letters only              |
| `email`        | string | Required, unique, `@gmail.com` only |
| `phone_code`   | string | Required, format: `+1` to `+9999`  |
| `phone_number` | string | Required, 4–15 digits               |
| `photo`        | file   | Required, JPG/JPEG only, max 5 MB   |

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

---

### `GET /api/uploads/<filename>`

Serves uploaded document photos.

---

### `GET /api/health`

Health check endpoint. Returns `{"status": "ok"}`.

---

## Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL=postgresql://patients_user:patients_pass@localhost:5432/patients_db
python run.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
patient-registration/
├── backend/
│   ├── app/
│   │   ├── __init__.py      # Flask factory
│   │   ├── database.py      # DB connection & schema init
│   │   ├── routes.py        # API endpoints
│   │   ├── validators.py    # Server-side validation
│   │   └── mailer.py        # Async email sending
│   ├── Dockerfile
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── styles/          # Global CSS
│   │   └── types/           # TypeScript types
│   ├── Dockerfile
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Frontend Validation Rules

| Field          | Rule                                  |
|----------------|---------------------------------------|
| Full name      | Letters (including accented), spaces, hyphens, apostrophes |
| Email          | Must end in `@gmail.com`             |
| Country code   | `+` followed by 1–4 digits           |
| Phone number   | 4–15 digits                          |
| Document photo | Drag-and-drop or click, JPG only     |

Validation errors appear below each field with a slide-down animation and are displayed as soon as the user attempts to submit.
