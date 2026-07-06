# AGENTS.md — KnowASong Backend

## Quick start

```bash
cp .env.example .env  # or use existing .env
docker compose up -d   # starts app (port 3000) + PostgreSQL
```

API runs at `http://localhost:3000/api/...`.

## Commands

```bash
npm start       # node app.js
npm run dev     # nodemon app.js (auto-restart on changes)
```

No test, lint, typecheck, or build steps.

## Architecture

- **Single Express app** — no monorepo, no build step, plain `require()`.
- **Entrypoint**: `app.js` — mounts 5 routers under `/api`.
- **Pattern**: Controllers (`controller/`) call `pg-promise` directly; routes (`routes/`) wire HTTP verbs to controllers.
- **Auth**: custom token-based (random string, stored in `Users.token`). Passwords encrypted with `CryptoJS.AES`/ECB (not hashed). The seed user `admin` has plaintext password `admin`.

## API structure

All routes under `/api`:

| Prefix | File | Auth required |
|---|---|---|
| `/api/film*`, `/api/films` | `FilmRoutes.js` | No |
| `/api/song*`, `/api/songs` | `SongRoutes.js` | No |
| `/api/user*`, `/api/users` | `UserRoutes.js` | Token (in body) |
| `/api/user_role*`, `/api/user_roles` | `UserRoleRoutes.js` | No |
| `/api/authorize`, `/api/activate` | `AuthorizationRoutes.js` | No |

**Gotcha**: `GET /api/user/:id` and `GET /api/user/:username` are identical Express route patterns; whichever is defined first in `UserRoutes.js` handles both.

## Database

- **No migration tooling** — `database.sql` is the canonical schema + seed data.
- First Docker run: `init-db.sh` loads `database.sql` via `docker-entrypoint-initdb.d` (idempotent — skips if `apikeys` table exists).
- To reset: `docker compose down -v && docker compose up -d`.
- Connection config via env vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
- Default `pg-promise` pool: 30 connections.

## Auth flow

1. `POST /api/authorize` with `{username, password}` — returns a `token`.
2. Pass `token` in request body on protected endpoints.
3. Rights are checked via `UserType.rights` column (JSON-like string, e.g. `'{"authorization": 1, "edit_users": 0}'`).

## Docker

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
| `SECRET_KEY_SALT` | Yes | AES encryption salt (`.env` local) |
| `SECRET_KEY_IV` | Yes | AES encryption IV (`.env` local) |
| `PORT` | No | App port (default 3000) |

## Key conventions

- No async error handling middleware — each controller has inline try/catch returning `409` on error.
- `console.info` / `console.log` used for logging throughout controllers.
- `cors()` enabled globally with defaults (all origins allowed).
- `express.json()` body parser enabled globally.
- Routes send raw pg-promise response objects (no envelope format).
