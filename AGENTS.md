# AGENTS.md — KnowASong Monorepo

## Structure

```
know-a-song/
├── apps/
│   ├── backend/              # NestJS + Drizzle (active)
│   ├── backend-legacy/       # Express legacy (reference only)
│   ├── frontend/             # Next.js 16 + React 19 (active)
│   └── frontend-legacy/      # CRA legacy (reference only)
├── packages/
│   ├── shared/               # Zod schemas, types
│   └── database/             # Drizzle schema + migrations
├── docker-compose.yml        # PostgreSQL + backend
├── package.json              # npm workspaces root (npm@10)
└── turbo.json                # Turborepo
```

## Node.js

This project requires **Node.js >= 20**. Use nvm:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22
```

## Docker Architecture

| Mode | Postgres | Backend | Frontend |
|------|----------|---------|----------|
| Dev (`docker compose up`) | Container | Local (hot-reload) | Local (HMR) |
| Prod (`docker compose -f docker-compose.prod.yml up --build`) | Container | Container | Container |

## Quick Start (Dev)

```bash
nvm use 22
npm install
docker compose up -d          # starts postgres only
npm run generate -w packages/database
npm run push -w packages/database
npm run dev                    # backend + frontend local (hot-reload)
```

- Backend: http://localhost:3000 (Swagger: /api/docs)
- Frontend: http://localhost:3001

## Quick Start (Production)

```bash
docker compose -f docker-compose.prod.yml up --build
```

All services in containers. Frontend uses Next.js standalone output.

## Manage Script

`./manage.sh` — interactive project manager.

```bash
./manage.sh          # interactive menu (numbered options)
./manage.sh dev      # start dev mode (postgres + migrate + backend + frontend)
./manage.sh build    # build all apps
./manage.sh backup   # pg_dump to backups/db_TIMESTAMP.sql
./manage.sh restore  # select backup file, restore
./manage.sh status   # show Node/Docker/backup status
```

## Root Commands

```bash
npm run dev              # turbo dev (all apps)
npm run build            # turbo build
npm run lint             # turbo lint
npm run typecheck        # turbo typecheck
npm run format           # prettier --write
npm audit                # should show 0 vulnerabilities
```

Single workspace:
```bash
npm run dev -w apps/backend
npm run dev -w apps/frontend
```

## Backend (NestJS)

- Port 3000, Swagger at `/api/docs`
- Auth: POST `/api/auth/login` → JWT (15m) + httpOnly refresh cookie (7d)
- POST `/api/auth/refresh` — uses httpOnly cookie
- Global ZodValidationPipe + GlobalExceptionFilter
- Drizzle ORM with PostgreSQL
- Modules: `auth`, `films`, `songs`, `users`, `user-roles`
- Sentry: initialized in `main.ts` with `SENTRY_DSN` env var

## Frontend (Next.js)

- Next.js 16 App Router + React 19
- Tailwind CSS v4 + shadcn/ui (based on @base-ui/react)
- State: Zustand (player-store, auth-store)
- Data fetching: TanStack React Query
- API: `src/lib/api.ts` (typed, auto-refresh on 401) + `src/lib/api-client.ts` (TMDB wrapper)
- i18n: next-intl (en + ru), locale selector in header
- Sentry: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`

### Pages

| Route | Description |
|-------|-------------|
| `/` | Home with LeftBar + RightBar |
| `/films` | Film gallery with search |
| `/film/[type]/[id]` | Film detail + song player |
| `/login` | Sign in |
| `/register` | Create account |
| `/settings` | Account settings |
| `/admin/users` | User management |
| `/admin/roles` | Role management |

### Frontend Env

- `NEXT_PUBLIC_API_URL` — default `http://localhost:3000/api`
- `NEXT_PUBLIC_TMDB_TOKEN` — TMDB Bearer token
- `NEXT_PUBLIC_SENTRY_DSN` — optional

## Phase Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | Complete | Security fixes in legacy code |
| 1 | Complete | Monorepo tooling + packages/shared |
| 2 | Complete | Backend rewrite (NestJS + Drizzle) |
| 3 | Complete | Frontend rewrite (Next.js + Tailwind) |
| 4 | Complete | Integration (auth, search, settings, docker-compose, refresh tokens) |
| 5 | Complete | Polish (admin, CI/CD, Sentry, i18n) |

## History

Both apps imported with full git history via `git filter-repo --to-subdirectory-filter`.
- `git log -- apps/backend/` — full backend history
- `git log -- apps/frontend/` — full frontend history
