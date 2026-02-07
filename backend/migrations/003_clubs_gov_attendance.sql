-- Change default role from 'student' to 'guest'
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'guest';

-- Add school integration columns + coins to users
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS school_login VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS school_level INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS school_xp BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS audit_ratio FLOAT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS coins INT NOT NULL DEFAULT 0;

-- Attendance tracking
CREATE TABLE IF NOT EXISTS attendance (
    id              SERIAL PRIMARY KEY,
    user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_name      VARCHAR(255) NOT NULL,
    coins_awarded   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent double check-in per event per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_user_event_day
    ON attendance (user_id, event_name, (created_at::date));

-- Clubs
CREATE TABLE IF NOT EXISTS clubs (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    image_url   TEXT NOT NULL DEFAULT '',
    schedule    TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS club_members (
    id          SERIAL PRIMARY KEY,
    club_id     INT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(club_id, user_id)
);

-- Student Government
CREATE TABLE IF NOT EXISTS gov_members (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    role_title      VARCHAR(255) NOT NULL,
    photo_url       TEXT NOT NULL DEFAULT '',
    contact_url     TEXT NOT NULL DEFAULT '',
    display_order   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
