# AGENTS.md — KnowASong Monorepo

## Structure

```
know-a-song/
├── apps/
│   ├── backend/         # Express + PostgreSQL (legacy, Phase 0)
│   └── frontend/        # Create React App (legacy, Phase 0)
├── packages/            # shared, database (future)
├── package.json         # npm workspaces root
└── turbo.json
```

## Root commands

```bash
npm run dev              # turbo dev (all apps)
npm run build            # turbo build
npm run lint             # turbo lint
npm run typecheck        # turbo typecheck
npm run format           # prettier —write
```

Run a single workspace:
```bash
npm run dev -w apps/backend
npm run start -w apps/frontend
```

## Phase roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| 0 | **Complete** | Security fixes in legacy code |
| 1 | **Complete** | Monorepo tooling + packages/shared |
| 2 | Planned | Backend rewrite (NestJS + Drizzle) |
| 3 | Planned | Frontend rewrite (Next.js + Tailwind) |
| 4 | Planned | Integration (auth, search, settings) |
| 5 | Future | Polish (admin, CI/CD, i18n) |

## Key files per app

See `apps/backend/AGENTS.md` and `apps/frontend/AGENTS.md`.

## History

Both apps imported with full git history via `git filter-repo --to-subdirectory-filter`.
- `git log -- apps/backend/` — full backend history
- `git log -- apps/frontend/` — full frontend history
- `git blame apps/backend/app.js` — preserves original authors
