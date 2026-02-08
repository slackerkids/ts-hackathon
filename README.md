# TS Community OS

A Telegram Mini App that serves as the digital hub for Tomorrow School students: news, clubs, hackathons, student government, shop, and gamification (coins, leaderboard, attendance). Built for the TS Community OS hackathon track.

---

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [How It Works](#how-it-works)
- [Requirements](#requirements)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Database](#database)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)

---

## Architecture

**Components**

| Layer | Technology | Role |
|-------|------------|------|
| Client | Telegram WebView (or browser in dev) | Loads the app; Telegram injects `initData` (user + signature) into the page. |
| Frontend | Next.js 16, React 19, Tailwind, shadcn/ui | Served at your origin (e.g. ngrok in dev). Reads `initData` via `@tma.js/sdk-react`, sends it in `Authorization: tma <initData>` on every API request. Proxies `/api/*` to the backend in dev. |
| Backend | Go, net/http, oapi-codegen | Validates `initData` locally with the bot token (HMAC), loads/creates user from DB, serves REST API. Optionally calls Telegram API for push and external APIs for school/AI. |
| Database | PostgreSQL 16 | Persists users, news, hackathons, clubs, gov, shop, attendance, purchases. |

**Request flow (authenticated)**

```
Telegram (or browser)  -->  Frontend (Next.js)
                                |
                                |  GET/POST /api/...  +  Header: "Authorization: tma <initData>"
                                v
                           Backend (Go)
                                |
                                |  1. Validate initData with BOT_TOKEN (no call to Telegram)
                                |  2. Resolve user by telegram_id (DB)
                                |  3. Handle request, read/write DB
                                v
                           PostgreSQL
```

**Optional backend outbound:** On "create news", backend may call Telegram Bot API to push a message to users. For AI summarization, backend calls OpenAI. School verification (if enabled) calls an external school API.

**Diagram (Mermaid)**

```mermaid
flowchart LR
  subgraph client [Client]
    TG[Telegram WebView]
  end
  subgraph app [Your stack]
    FE[Next.js Frontend]
    BE[Go Backend]
    DB[(PostgreSQL)]
  end
  TG -->|"Load app URL"| FE
  FE -->|"REST + tma initData"| BE
  BE --> DB
```

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui. Runs in the browser or Telegram WebView. Uses `@tma.js/sdk-react` for init data, back button, theme.
- **Backend:** Go HTTP server; OpenAPI spec in `backend/api/openapi3/api.yaml`, code generated with oapi-codegen. Auth = validate `initData` with bot token, then lookup user in DB. Optional gateways: Telegram (push), school (verify student), OpenAI (summarize).
- **Database:** PostgreSQL 16. Migrations in `backend/migrations/`; seed in `seed.sql`. Repositories use `pgx` and raw SQL.

---

## Features

**Student-facing**

- **Dashboard (Home):** Greeting, role, coins, level, nearest event (active hackathon), leaderboard (top 5), latest news with tags, quick actions grid. Bottom tab bar: Home, News, Events, Clubs, Shop, Profile.
- **News:** List and detail; tags (e.g. Official, Hackathon, Life, Education). Optional AI summarization on detail (requires `OPENAI_API_KEY`).
- **Student Government:** List of members with photo, role, contact link.
- **Clubs:** Catalog and detail; join/leave with optimistic UI; schedule and description.
- **Hackathons:** List (active/past), detail, apply (solo or with team name); optimistic apply.
- **Shop:** List of items (name, description, price in coins, stock). Purchase flow (backend deducts coins and records purchase).
- **Profile:** FIO, nickname, role, Telegram ID, school login (if verified), school stats (level, XP, audit ratio), coins, QR code (user id for admin check-in), attendance history. Guest users can verify via school credentials to become students. Theme switcher: Light / Dark / System (Telegram or OS).

**Admin (CMS)**

- **Access:** Only users with role `admin`. Non-admins see an Admin entry on Home that leads to a login form; correct `ADMIN_USERNAME`/`ADMIN_PASSWORD` promotes the current Telegram user to admin. Admin layout includes a back button: "Back to Admin" on subpages, "Home" on `/admin`.
- **News CMS:** Create post (title, tag, image URL, content). On create, backend broadcasts a push to all users via the Telegram bot.
- **Hackathons:** Create event; list; per-event list of applications with CSV export.
- **QR Scanner:** Scan QR from student profile (user id); check-in with event name and coins to award; backend creates attendance and adds coins.
- **Clubs:** Create club; list; delete.
- **Government:** Add/remove government members (name, role title, photo URL, contact URL, order).
- **Shop:** Create item (name, description, image URL, price, stock); list; delete.

**Technical**

- **Auth:** No passwords for students. Backend validates Telegram `initData` (HMAC-SHA256, 24h TTL), resolves user by `telegram_id`, creates user if new (default role `guest`). All non-public API requests require `Authorization: tma <initData>`.
- **Roles:** `guest` (public news only; can verify via school to become `student`), `student`, `club_leader`, `admin`. Admin-only routes enforced in handler.
- **Theme:** Light/dark/system; preference stored in `localStorage`; system follows Telegram theme in Mini App or `prefers-color-scheme` in browser.
- **Optimistic UI:** Club join/leave and hackathon apply update the UI immediately and revert on API error.

---

## How It Works

1. **Opening in Telegram:** User opens the Mini App. Telegram injects `initData` (user, hash, auth date). Frontend calls `POST /api/auth/telegram` with this; backend validates the hash with `BOT_TOKEN`, finds or creates the user, returns the user (role, coins, etc.). Frontend stores user in context and sends `Authorization: tma <initData>` on every API call.
2. **Opening in browser (dev):** No `initData`. Auth fails; user is null. Public GET (news, hackathons, clubs, gov, leaderboard, shop) still work. To test authenticated flows, use Telegram or mock initData in dev.
3. **Admin:** An admin user sees the Admin card on Home. Others see the same card; clicking it shows the admin login form. Submitting correct credentials calls `POST /api/auth/admin`; backend promotes that user to `admin` and returns the updated user. Subsequent visits to `/admin` show the panel.
4. **API proxy (dev):** Next.js `rewrites` in `next.config.ts` send `/api/*` to `http://localhost:8080`, so the frontend uses relative URLs and CORS is avoided.

---

## Requirements

- **Go** 1.21+ (backend)
- **Node.js** 18+ and npm (frontend)
- **PostgreSQL** 16 (or use Docker via `make db`)
- **Telegram Bot Token** (create via [@BotFather](https://t.me/BotFather)); set as `BOT_TOKEN` for backend initData validation and optional push

Optional:

- **OPENAI_API_KEY** for news summarization (AI)
- **ngrok** (or similar) to expose the frontend for Telegram Mini App testing

---

## Configuration

Copy environment from the example and adjust:

```bash
cp .env.example .env
```

**Backend (root or backend directory)**

| Variable          | Required | Description |
|-------------------|----------|-------------|
| `PORT`            | No       | HTTP port (default `8080`) |
| `DATABASE_URL`    | Yes      | PostgreSQL connection string (e.g. `postgres://postgres:postgres@localhost:5432/ts_community?sslmode=disable`) |
| `BOT_TOKEN`       | Yes      | Telegram bot token (validates initData; used for push) |
| `FRONTEND_URL`    | No       | Allowed CORS origin (default `http://localhost:3000`) |
| `OPENAI_API_KEY`  | No       | Enables AI summarization for news |
| `ADMIN_USERNAME`  | No       | Admin login username (default `admin`) |
| `ADMIN_PASSWORD`  | No       | Admin login password (default `admin`) |

**Frontend**

| Variable               | Required | Description |
|------------------------|----------|-------------|
| `NEXT_PUBLIC_API_URL`  | No       | Not used when Next rewrites `/api` to backend; set if API is on another host in production |

---

## Running the Project

**One-shot: database, migrations, seed, backend, frontend, ngrok**

```bash
make all
```

This will:

1. Stop any existing processes on ports 8080 and 3000 and tear down ngrok.
2. Start PostgreSQL (Docker) on port 5432.
3. Run all migrations from `backend/migrations/*.sql` (excluding `seed.sql`).
4. Run `seed.sql` (wipe and insert demo data).
5. Start the Go backend in the background on `PORT` (default 8080).
6. Install frontend deps (if needed) and start Next.js dev server in the background on port 3000.
7. Start ngrok tunneling to port 3000 (if installed).

Then open:

- Frontend: http://localhost:3000  
- Backend: http://localhost:8080  
- ngrok URL: printed in terminal or http://127.0.0.1:4040  

**Step-by-step**

```bash
# Database only
make db

# Migrations (includes make db)
make migrate

# Seed (includes migrate)
make seed

# Backend only (expects DB and .env)
make backend

# Frontend only
make frontend

# Tunnel for Telegram (optional)
make ngrok
```

**Stop everything**

```bash
make stop
```

**Regenerate OpenAPI server code (after editing api.yaml)**

```bash
make generate
```

**Clean frontend cache**

```bash
make clean
```

**Manual backend run**

```bash
# From repo root; .env is loaded by Makefile via include .env
cd backend && go run ./cmd/main.go
```

**Manual frontend run**

```bash
cd frontend && npm install && npm run dev
```

---

## Database

- **Name:** `ts_community` (Docker Compose default).
- **Migrations:** Applied in lexicographic order: `001_init.sql` (users), `002_news_hackathons.sql`, `003_clubs_gov_attendance.sql`, `004_shop.sql`. Do not edit applied migrations; add new numbered files.
- **Seed:** `backend/migrations/seed.sql` truncates data (preserving schema) and inserts news, hackathons, clubs, government members, and shop items. Run with `make seed` (or manually after migrations).

**Applying migrations by hand (example)**

```bash
export PGPASSWORD=postgres
for f in backend/migrations/0*.sql; do psql -h localhost -U postgres -d ts_community -f "$f"; done
psql -h localhost -U postgres -d ts_community -f backend/migrations/seed.sql
```

---

## API Overview

- **Health:** `GET /api/health`
- **Auth:** `POST /api/auth/telegram`, `POST /api/auth/school`, `POST /api/auth/admin`
- **Users:** `GET /api/users/me`
- **News:** `GET /api/news`, `GET /api/news/{id}`, `POST /api/news` (admin), `PUT /api/news/{id}` (admin), `DELETE /api/news/{id}` (admin). Optional: `GET /api/news/{id}/summarize` (AI).
- **Hackathons:** `GET /api/hackathons`, `GET /api/hackathons/{id}`, `POST /api/hackathons/{id}/apply`, `POST /api/hackathons` (admin), `DELETE /api/hackathons/{id}` (admin), `GET /api/hackathons/{id}/applications` (admin).
- **Attendance:** `POST /api/attendance/check-in` (admin), `GET /api/attendance/history` (authenticated).
- **Clubs:** `GET /api/clubs`, `GET /api/clubs/{id}`, `POST /api/clubs/{id}/join`, `DELETE /api/clubs/{id}/leave`, `POST /api/clubs` (admin), `DELETE /api/clubs/{id}` (admin).
- **Government:** `GET /api/gov`, `POST /api/gov` (admin), `DELETE /api/gov/{id}` (admin).
- **Leaderboard:** `GET /api/leaderboard`
- **Shop:** `GET /api/shop`, `POST /api/shop/{id}/purchase`, `POST /api/shop` (admin), `DELETE /api/shop/{id}` (admin)

Full request/response shapes are in `backend/api/openapi3/api.yaml`. Generated server and types live in `backend/generated/`.

---

## Project Structure

```
ts-hackathon/
  .env.example           # Example env vars
  Makefile               # db, migrate, seed, backend, frontend, ngrok, stop, all
  docker-compose.yml     # PostgreSQL 16
  README.md              # This file

  backend/
    api/openapi3/
      api.yaml           # OpenAPI 3 spec
    cmd/main.go          # Entrypoint
    config-oapi-generator.yaml
    generated/           # oapi-codegen output (server, types)
    internal/
      app/               # Wire DB, services, handler, middleware
      config/            # Load env
      gateway/           # Telegram, school, OpenAI
      handler/           # HTTP handlers
      middleware/       # Auth, CORS
      model/             # Domain models
      repository/        # DB access
      service/           # Business logic
    migrations/         # SQL migrations + seed.sql
    go.mod, go.sum

  frontend/
    app/                 # Next.js App Router
      admin/             # CMS routes (layout with back button)
      clubs/, gov/, hackathons/, news/, profile/, shop/
      components/        # e.g. bottom-nav
      layout.tsx, page.tsx, providers.tsx, globals.css
    components/ui/       # shadcn components
    lib/
      api.ts             # fetch wrapper, injects tma initData
      auth.tsx            # AuthProvider, useUser
      theme.tsx          # ThemeProvider, useTheme, ThemeSwitcher
      utils.ts
    next.config.ts       # rewrites /api -> backend
    package.json
```

---

## License

See [LICENSE](LICENSE) in the repository.
