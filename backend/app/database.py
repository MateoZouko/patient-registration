import os
import psycopg2
from psycopg2.extras import RealDictCursor


def get_connection():
    return psycopg2.connect(
        os.environ["DATABASE_URL"],
        cursor_factory=RealDictCursor,
    )


def init_db() -> None:
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS patients (
                    id          SERIAL PRIMARY KEY,
                    full_name   VARCHAR(255) NOT NULL,
                    email       VARCHAR(255) NOT NULL UNIQUE,
                    phone_code  VARCHAR(10)  NOT NULL,
                    phone_number VARCHAR(30) NOT NULL,
                    photo_path  VARCHAR(512) NOT NULL,
                    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
                );
                """
            )
        conn.commit()
    finally:
        conn.close()
