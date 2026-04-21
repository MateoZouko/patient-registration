# Patient Registration

A full-stack application for registering patients. Built with PHP/Laravel (backend) and React + TypeScript (frontend), backed by PostgreSQL, containerised with Docker.

## Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Backend   | PHP 8.2, Laravel 11, raw SQL (no ORM)       |
| Frontend  | React 19, TypeScript, Vite                  |
| Database  | PostgreSQL 15                               |
| Email     | SMTP + Laravel Queues (Mailtrap for dev)    |
| Container | Docker + Docker Compose                     |

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

| Service       | URL                        |
|---------------|----------------------------|
| Frontend      | http://localhost:3000      |
| Backend (API) | http://localhost:5000      |

The database schema is created automatically on first startup via Laravel migrations.

---

## Running Tests

Tests run inside the backend container (no local PHP environment required).

```bash
docker compose exec backend php artisan test
```

**45 tests** covering:

| Suite | Tests |
|---|---|
| `Unit/ValidatorTest` | Every validation rule — name (letters only, accents, length), email (@gmail.com), country code (+N format), phone number (4–15 digits), photo extension and MIME type |
| `Feature/PatientTest` | Health check, patient listing, successful registration, field validation errors, PNG renamed to .jpg rejected by MIME check, duplicate email (409), queue job dispatch |

To run a specific suite:

```bash
docker compose exec backend php artisan test --testsuite=Unit
docker compose exec backend php artisan test --testsuite=Feature
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
    "photo_path": "/api/uploads/uuid.jpg",
    "created_at": "2026-01-15 10:30:00+00"
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

**Response `413`** — file exceeds the 5 MB limit (handled by Laravel's `ValidatePostSize` middleware).

---

### `GET /api/uploads/<filename>`

Serves uploaded document photos directly from storage.

---

### `GET /api/health`

Health check. Returns `{"status": "ok"}`.

---

## Development (without Docker)

### Backend

Requires PHP 8.2, Composer, and a running PostgreSQL instance.

```bash
cd backend
composer install
cp .env.example .env   # set DB_* and MAIL_* vars
php artisan key:generate
php artisan migrate
php artisan serve
```

To process queued emails in the background:

```bash
php artisan queue:work
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
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   └── PatientController.php   # GET /patients, POST /patients, GET /uploads
│   │   │   └── Requests/
│   │   │       └── RegisterPatientRequest.php  # Field validation (FormRequest)
│   │   ├── Jobs/
│   │   │   └── SendPatientNotification.php # Queue job — dispatches email after registration
│   │   └── Mail/
│   │       └── PatientRegistered.php       # Mailable — confirmation email
│   ├── bootstrap/
│   │   └── app.php                         # Enables API routing (opt-in in Laravel 11)
│   ├── config/
│   │   └── cors.php                        # CORS — allows frontend origin
│   ├── database/
│   │   └── migrations/
│   │       └── ..._create_patients_table.php
│   ├── resources/views/emails/
│   │   └── patient_registered.blade.php    # HTML email template
│   ├── routes/
│   │   └── api.php                         # All API route definitions
│   ├── tests/
│   │   ├── Feature/PatientTest.php         # 13 integration tests
│   │   └── Unit/ValidatorTest.php          # 32 unit tests
│   ├── Dockerfile
│   ├── entrypoint.sh                       # Writes .env, waits for DB, runs migrations
│   └── phpunit.xml
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
