CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    telegram_id   BIGINT UNIQUE NOT NULL,
    username      VARCHAR(255) NOT NULL DEFAULT '',
    first_name    VARCHAR(255) NOT NULL DEFAULT '',
    last_name     VARCHAR(255) NOT NULL DEFAULT '',
    photo_url     TEXT NOT NULL DEFAULT '',
    role          VARCHAR(50) NOT NULL DEFAULT 'student',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
