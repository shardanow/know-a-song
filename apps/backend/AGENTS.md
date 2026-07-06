# AGENTS.md — KnowASong Backend (apps/backend/)

## Quick start

```bash
cd apps/backend
cp .env.example .env  # or use existing .env
docker compose up -d   # starts app (port 3000) + PostgreSQL
```

API runs at `http://localhost:3000/api/...`.

## Commands

```bash
# from repo root:
npm run dev -w apps/backend        # nodemon app.js
npm run start -w apps/backend      # node app.js

# or from apps/backend/:
cd apps/backend && npm start
```

No test, lint, typecheck, or build steps.

## Architecture

- **Single Express app** — no monorepo, no build step, plain `require()`.
- **Entrypoint**: `app.js` — mounts 5 routers under `/api`.
- **Pattern**: Controllers (`controller/`) call `pg-promise` directly; routes (`routes/`) wire HTTP verbs to controllers.
- **Auth**: token-based (Authorization: Bearer). Passwords hashed with bcrypt.

## API structure

All routes under `/api`:

| Prefix | File | Auth required |
|---|---|---|
| `/api/film*`, `/api/films` | `FilmRoutes.js` | No |
| `/api/song*`, `/api/songs` | `SongRoutes.js` | No |
| `/api/user*`, `/api/users` | `UserRoutes.js` | Bearer token |
| `/api/user_role*`, `/api/user_roles` | `UserRoleRoutes.js` | No |
| `/api/authorize`, `/api/activate` | `AuthorizationRoutes.js` | No |

Auth middleware (`middleware/auth.js`) extracts Bearer token from `Authorization` header into `req.token`.

## Database

- **No migration tooling** — `database.sql` is the canonical schema + seed data.
- First Docker run: `init-db.sh` loads `database.sql` via `docker-entrypoint-initdb.d` (idempotent — skips if `apikeys` table exists).
- To reset: `docker compose down -v && docker compose up -d`.
- Connection config via env vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- Default `pg-promise` pool: 30 connections.

## Auth flow

1. `POST /api/authorize` with `{username, password}` — returns a `token`.
2. Pass `Authorization: Bearer <token>` header on protected endpoints.
3. Rights are checked via `UserType.rights` column (JSON-like string, e.g. `'{"authorization": 1, "edit_users": 0}'`).

## Docker

Run from `apps/backend/` dir:
```bash
cd apps/backend && docker compose up -d
```

| Command | What it does |
|---|---|
| `docker compose up -d` | Starts app + postgres:13.4 on port 3000 |
| `docker compose down -v` | Stops and deletes DB volume |

- PostgreSQL runs on port 5432 (exposed), credentials: `postgres`/`root`.
- App container uses `npm start` (production mode, no nodemon).
- No hot-reload in Docker.

## Env vars

| Variable | Required | Purpose |
|---|---|---|
| `DB_HOST` | Yes | PostgreSQL host (default: `localhost`, `db` in Docker) |
| `DB_PORT` | Yes | PostgreSQL port |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | DB user |
| `DB_PASSWORD` | Yes | DB password |
| ~~`SECRET_KEY_SALT`~~ | No | Removed in Phase 0 — no longer used |
| ~~`SECRET_KEY_IV`~~ | No | Removed in Phase 0 — no longer used |
| `PORT` | No | App port (default 3000) |

## Key conventions

- No async error handling middleware — each controller has inline try/catch returning `409` on error.
- `console.info` / `console.log` used for logging throughout controllers.
- `cors()` enabled globally with defaults (all origins allowed).
- `express.json()` body parser enabled globally.
- Routes send raw pg-promise response objects (no envelope format).
