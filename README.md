# Know A Song

Discover and play songs from your favorite films and TV series. Integrates with TMDB for metadata and YouTube for playback.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Monorepo | npm workspaces + Turborepo |
| Backend | NestJS 11 + Drizzle ORM + PostgreSQL |
| Frontend | Next.js 16 (App Router) + React 19 |
| CSS | Tailwind CSS v4 + shadcn/ui |
| Validation | Zod (`packages/shared`) |
| Auth | Passport.js JWT (access token + httpOnly refresh cookie) |
| State (FE) | TanStack React Query + Zustand |
| API | REST + Swagger (`/api/docs`) |
| Monitoring | Sentry (frontend + backend) |

## Project Structure

```
know-a-song/
├── apps/
│   ├── backend/              # NestJS API (port 3000)
│   ├── backend-legacy/       # Express legacy (reference only)
│   ├── frontend/             # Next.js App Router (port 3001)
│   └── frontend-legacy/      # CRA legacy (reference only)
├── packages/
│   ├── shared/               # Zod schemas, types
│   └── database/             # Drizzle schema + migrations
├── docker-compose.yml        # PostgreSQL (dev)
├── docker-compose.prod.yml   # PostgreSQL + backend + frontend
├── package.json              # Root workspace
└── turbo.json                # Turborepo config
```

## Setup

### Requirements

- Node.js >= 20 (use nvm: `nvm use 22`)
- Docker (for PostgreSQL)

### Quick Start (Development)

```bash
# 1. Use correct Node version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22

# 2. Install dependencies
npm install

# 3. Start PostgreSQL (Docker)
docker compose up -d

# 4. Run database migrations
npm run generate -w packages/database
npm run push -w packages/database

# 5. Start development servers (local, with hot-reload)
npm run dev
```

This starts:
- **Backend** at `http://localhost:3000` (Swagger: `/api/docs`)
- **Frontend** at `http://localhost:3001`

### Production (Docker)

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml up --build
```

This runs everything in containers:
- **PostgreSQL** — `postgres:16-alpine`
- **Backend** — multi-stage Dockerfile (Node 22, NestJS)
- **Frontend** — multi-stage Dockerfile (Next.js standalone)

### Environment Variables

**Backend** (`apps/backend/.env`):
- `DATABASE_URL` — PostgreSQL connection string (default: `postgres://postgres:root@localhost:5432/knowasong`)
- `JWT_SECRET` — JWT signing secret (default: `know-a-song-dev-secret`)
- `CORS_ORIGIN` — Allowed CORS origin (default: `http://localhost:3001`)
- `SENTRY_DSN` — Sentry DSN (optional)

**Frontend** (`apps/frontend/.env.local`):
- `NEXT_PUBLIC_API_URL` — Backend API URL (default: `http://localhost:3000/api`)
- `NEXT_PUBLIC_TMDB_TOKEN` — TMDB API Bearer token
- `NEXT_PUBLIC_SENTRY_DSN` — Sentry DSN (optional)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps |
| `npm run lint` | Lint all apps |
| `npm run typecheck` | TypeScript check all apps |
| `npm run format` | Format code with Prettier |
| `npm run dev -w apps/backend` | Backend only |
| `npm run dev -w apps/frontend` | Frontend only |

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/refresh` | — | Refresh access token |
| GET | `/api/films` | — | List all films |
| GET | `/api/film/:id/by_id` | — | Film by ID |
| GET | `/api/film/:slug/by_slug` | — | Film by slug |
| GET | `/api/songs/:filmId` | — | Songs by film |
| GET | `/api/songs?filmIds=1,2,3` | — | Batch songs |
| GET | `/api/users` | JWT | List users (admin) |
| PUT | `/api/user/type/:id` | JWT | Update user role (admin) |
| GET | `/api/user-types` | JWT | List user roles (admin) |

Full Swagger docs at `/api/docs` when backend is running.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home with sidebars |
| `/films` | Film gallery with search |
| `/film/[type]/[id]` | Film detail with song player |
| `/login` | Sign in |
| `/register` | Create account |
| `/settings` | Account settings |
| `/admin/users` | User management (admin) |
| `/admin/roles` | Role management (admin) |

## Manage Script

`./manage.sh` — интерактивная утилита для управления проектом.

**CLI режим:** `./manage.sh <command>`

**Интерактивный режим:** `./manage.sh` — выбрать действие по номеру.

| Команда | Описание |
|---------|----------|
| `setup` | Первый запуск: nvm → npm i → docker up → migrate → dev |
| `dev` | Запустить dev (postgres + миграции + backend + frontend) |
| `prod` | Запустить production (docker compose) |
| `build` | Собрать backend + frontend (npm) |
| `rebuild` | Пересобрать Docker образы (--no-cache) |
| `backup` | Бэкап PostgreSQL в `backups/db_<timestamp>.sql` |
| `restore` | Восстановить PostgreSQL из бэкапа (интерактивно) |
| `logs` | Логи сервиса (postgres/backend/frontend) |
| `stop` | Остановить Docker контейнеры |
| `reset` | Сбросить БД (drop → recreate → migrate) |
| `lint` | Линтер + typecheck |
| `audit` | Проверить уязвимости (npm audit) |
| `status` | Статус проекта (Node, Docker, backups) |

## Legacy Code

The original Express + CRA code is preserved in `apps/backend-legacy/` and `apps/frontend-legacy/` for reference. Both are excluded from the workspace to avoid dependency conflicts.
