CREATE TABLE IF NOT EXISTS news (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(500) NOT NULL,
    content     TEXT NOT NULL,
    image_url   TEXT NOT NULL DEFAULT '',
    tag         VARCHAR(100) NOT NULL DEFAULT 'Official',
    author_id   INT REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hackathons (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status      VARCHAR(50) NOT NULL DEFAULT 'active',
    start_date  TIMESTAMPTZ NOT NULL,
    end_date    TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hackathon_applications (
    id            SERIAL PRIMARY KEY,
    hackathon_id  INT NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
    user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_name     VARCHAR(255) NOT NULL DEFAULT '',
    status        VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(hackathon_id, user_id)
);
