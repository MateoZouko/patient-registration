#!/bin/sh
set -e

# Rebuild .env from container environment so Docker env vars take precedence
cat > /app/.env << EOF
APP_NAME=PatientRegistration
APP_ENV=${APP_ENV:-local}
APP_KEY=
APP_DEBUG=${APP_DEBUG:-true}
APP_URL=http://localhost

DB_CONNECTION=${DB_CONNECTION:-pgsql}
DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-5432}
DB_DATABASE=${DB_DATABASE:-patients_db}
DB_USERNAME=${DB_USERNAME:-patients_user}
DB_PASSWORD=${DB_PASSWORD:-patients_pass}

CACHE_STORE=database
QUEUE_CONNECTION=${QUEUE_CONNECTION:-database}

MAIL_MAILER=${MAIL_MAILER:-smtp}
MAIL_HOST=${MAIL_HOST:-sandbox.smtp.mailtrap.io}
MAIL_PORT=${MAIL_PORT:-2525}
MAIL_USERNAME=${MAIL_USERNAME:-}
MAIL_PASSWORD=${MAIL_PASSWORD:-}
MAIL_FROM_ADDRESS=${MAIL_FROM_ADDRESS:-noreply@patients.dev}
MAIL_FROM_NAME="Patient Registration"

CORS_ALLOWED_ORIGIN=${CORS_ALLOWED_ORIGIN:-http://localhost:3000}
EOF

php artisan key:generate --force --no-interaction

# Wait for the database
until php -r "new PDO('pgsql:host=${DB_HOST:-db};port=${DB_PORT:-5432};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');" 2>/dev/null; do
  echo "[entrypoint] Waiting for database..."
  sleep 2
done

php artisan migrate --force --no-interaction

exec php artisan serve --host=0.0.0.0 --port=8000
