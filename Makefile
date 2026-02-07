# ─── TS Community OS ─────────────────────────────────────────────────────────
# Makefile — one command to rule them all
# ─────────────────────────────────────────────────────────────────────────────

include .env
export

.PHONY: db db-stop migrate seed backend frontend ngrok generate clean stop all

# ─── Individual targets ─────────────────────────────────────────────────────

## Start PostgreSQL via Docker Compose
db:
	@echo "▶ Starting PostgreSQL..."
	@docker compose up -d db
	@echo "✔ PostgreSQL is running on :5432"

## Stop PostgreSQL
db-stop:
	docker compose down

## Run all SQL migrations in order (excludes seed.sql)
migrate: db
	@echo "▶ Running migrations..."
	@for f in backend/migrations/[0-9]*.sql; do \
		echo "  → $$f"; \
		PGPASSWORD=postgres psql -h localhost -U postgres -d ts_community -f "$$f" -q 2>&1 | grep -v "already exists\|NOTICE\|IMMUTABLE" || true; \
	done
	@echo "✔ Migrations done"

## Wipe all data and insert demo seed data
seed: migrate
	@echo "▶ Seeding database..."
	@PGPASSWORD=postgres psql -h localhost -U postgres -d ts_community -f backend/migrations/seed.sql -q 2>&1 | grep -v "NOTICE" || true
	@echo "✔ Database seeded with demo data"

## Regenerate OpenAPI server code
generate:
	@echo "▶ Regenerating OpenAPI code..."
	cd backend && go run github.com/oapi-codegen/oapi-codegen/v2/cmd/oapi-codegen \
		--config config-oapi-generator.yaml api/openapi3/api.yaml
	@echo "✔ Generated"

## Kill anything on a given port (usage: $(call kill_port,8080))
define kill_port
	@lsof -ti:$(1) 2>/dev/null | xargs kill -9 2>/dev/null || true
endef

## Build & run the Go backend (background)
backend:
	$(call kill_port,8080)
	@sleep 0.5
	@echo "▶ Starting backend on :$(PORT)..."
	@cd backend && go run ./cmd/main.go &
	@sleep 4

## Install deps & run the Next.js frontend (background)
frontend:
	$(call kill_port,3000)
	@sleep 0.5
	@echo "▶ Starting frontend on :3000..."
	@cd frontend && npm install --silent 2>/dev/null && PORT=3000 npm run dev &
	@sleep 3

## Start ngrok tunnel pointing at the frontend
ngrok:
	@-pkill -f "ngrok http" 2>/dev/null || true
	@sleep 0.5
	@echo "▶ Starting ngrok tunnel → :3000..."
	@ngrok http 3000 > /dev/null &
	@sleep 2
	@echo "✔ ngrok URL: $$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['tunnels'][0]['public_url'])" 2>/dev/null || echo '(check http://127.0.0.1:4040)')"

## Stop all background processes
stop:
	@echo "▶ Stopping services..."
	$(call kill_port,8080)
	$(call kill_port,3000)
	@-pkill -f "ngrok http" 2>/dev/null || true
	@-docker compose down 2>/dev/null || true
	@echo "✔ All stopped"

## Clean build artifacts
clean:
	rm -rf frontend/.next frontend/node_modules/.cache
	@echo "✔ Cleaned"

# ─── Main target ─────────────────────────────────────────────────────────────

## Launch everything: Stop old → DB → Migrate → Seed → Backend → Frontend → ngrok
all: stop db migrate seed backend frontend ngrok
	@echo ""
	@echo "═══════════════════════════════════════════════════════"
	@echo "  TS Community OS is running!"
	@echo "  Backend  → http://localhost:$(PORT)"
	@echo "  Frontend → http://localhost:3000"
	@echo "═══════════════════════════════════════════════════════"
	@echo ""
	@echo "Run 'make stop' to shut everything down."
