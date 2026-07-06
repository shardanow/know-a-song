# KnowASong — Migration & Architecture Plan

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Monorepo | npm workspaces + Turborepo | Shared types, one CI, atomic PRs |
| Backend | NestJS | DI, guards, pipes, modules, Swagger |
| Frontend | Next.js (App Router) | SSR/SEO for public catalog, Image, prefetch |
| CSS | Tailwind CSS + shadcn/ui | Design system, faster UI dev |
| ORM | Drizzle | TypeScript-native, Zod integration, migrations |
| API | REST + `@nestjs/swagger` + `openapi-typescript` | Type-safe client, Swagger UI, no vendor lock |
| Validation | Zod | Single source of truth in `packages/shared` |
| Auth | Passport.js + JWT (access + refresh httpOnly cookies) | NestJS standard, stateless |
| State (FE) | TanStack React Query + Zustand | Server cache + client state |
| Database | PostgreSQL (existing) | No change |

## Monorepo structure

```
know-a-song/
├── apps/
│   ├── backend/              # NestJS (target)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/     # Login, register, refresh, JWT strategy
│   │   │   │   ├── users/    # CRUD + rights
│   │   │   │   ├── films/    # CRUD
│   │   │   │   ├── songs/    # CRUD + batch endpoint
│   │   │   │   └── user-roles/
│   │   │   ├── common/       # Guards, decorators, filters, pipes
│   │   │   └── main.ts
│   │   ├── drizzle.config.ts
│   │   └── docker-compose.yml
│   └── frontend/             # Next.js (target)
│       ├── src/
│       │   ├── app/
│       │   │   ├── (public)/ # Home, FilmDetail
│       │   │   └── (auth)/   # Login, Register, Settings
│       │   ├── components/
│       │   │   ├── ui/       # shadcn/ui components
│       │   │   ├── films/
│       │   │   ├── songs/    # Player, SongList, SongItem
│       │   │   └── layout/   # Header, Sidebar, Footer
│       │   ├── lib/          # api-client (generated), utils
│       │   └── stores/       # Zustand (auth, player)
│       └── tailwind.config.ts
├── packages/
│   ├── shared/               # Zod schemas, types, constants
│   └── database/             # Drizzle schema + client + migrations
├── turbo.json
├── package.json
└── docker-compose.yml        # postgres + backend
```

## Phase roadmap

### Phase 0 — Security fixes ← Complete ✅
- [x] Backend: bcrypt instead of CryptoJS.AES
- [x] Backend: `crypto.randomBytes` for tokens
- [x] Backend: Auth middleware (Authorization: Bearer)
- [x] Backend: Fix duplicate route `:id` / `:username`
- [x] Backend: password VARCHAR(255)
- [x] Backend: Zod validation on createUser/authorize
- [x] Frontend: TMDB key + API URL to `.env`
- [x] Frontend: Unified apiClient
- [x] Frontend: Remove dead code (Genre.jsx, UserSettings.jsx, YouTubePlayer.js)
- [ ] Screenshot UI for reference before Tailwind migration

### Phase 1 — Monorepo + Tooling ← Complete ✅
- [x] Create `packages/shared` with Zod schemas
- [x] Create `packages/database` with Drizzle schema + relations
- [x] Root ESLint + Prettier config
- [x] First migration generated from current schema

### Phase 2 — Backend rewrite (NestJS + Drizzle) (5-6 days)
- [ ] Init NestJS in `apps/backend`
- [ ] Auth module (Passport.js JWT)
- [ ] Users, Films, Songs, UserRoles modules
- [ ] Swagger docs on all endpoints
- [ ] Batch endpoint for songs (fix N+1)
- [ ] Global error filter + ZodValidationPipe

### Phase 3 — Frontend rewrite (Next.js + Tailwind) (6-7 days)
- [ ] Init Next.js in `apps/frontend`
- [ ] openapi-typescript codegen → api-client
- [ ] shadcn/ui component library
- [ ] Tailwind migration (compare with screenshots)
- [ ] React Query for data fetching
- [ ] Zustand for auth + player state

### Phase 4 — Integration (3 days)
- [ ] Auth UI (login/register)
- [ ] Search (connect SearchBar)
- [ ] User settings page
- [ ] Root docker-compose (postgres + backend)
- [ ] SSR features (metadata, Image, prefetch)

### Phase 5 — Polish (ongoing)
- [ ] Admin panel (user/role management)
- [ ] CI/CD (GitHub Actions)
- [ ] Sentry / monitoring
- [ ] i18n (next-intl)

## Key architectural decisions

| Decision | Choice | Why not the alternative |
|----------|--------|------------------------|
| API style | REST + OpenAPI | tRPC adds vendor lock, needs public API later |
| NestJS | Full framework | Hono too lightweight for growth, Express is legacy |
| Frontend framework | Next.js | Vite lacks SSR for public catalog SEO |
| ORM | Drizzle | Prisma is heavier, TypeORM is legacy in NestJS ecosystem |
| CSS approach | Tailwind + shadcn/ui | Faster iterations, design system out of the box |
