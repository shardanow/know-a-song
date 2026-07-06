# AGENTS.md — KnowASong Frontend (apps/frontend/)

## Quick start

```bash
# from repo root:
npm run start -w apps/frontend    # CRA dev server on port 8080

# or from apps/frontend/:
cd apps/frontend && npm start
```

Requires the **backend** (`know_a_song_back_end`) running on `http://localhost:3000` — API URLs are hardcoded.

```bash
docker compose up --build -d   # runs on port 8080 with hot-reload
./init.sh                      # start Docker then sync node_modules to host
```

## Commands

```bash
npm start       # react-scripts start (dev server)
npm run build   # react-scripts build → /build
npm test        # react-scripts test (Jest via CRA)
```

No lint or typecheck configured beyond CRA defaults.

## Architecture

- **Create React App** (react-scripts 5) — `webpack.config.js` only adds SCSS loader; do not eject.
- **React 19** with **React Router v7** — routes in `src/App.jsx`:
  - `/` → Home (LeftBar + RightBar)
  - `/films` → Film list
  - `/film/:type/:id` → Film detail with songs + player
- **No state management** — local `useState`/`useEffect` only.
- **SCSS** via Dart Sass: styles in `src/content/styles/`, main entry `main.scss`.

## Data flow

- **App API** (`REACT_APP_API_URL` from `.env`): `src/Services/API/apiClient.js` — unified client
- **TMDB API** (`REACT_APP_TMDB_TOKEN` from `.env`): same `apiClient.js`
- **YouTube**: `react-player` in `src/Components/Song/Player.jsx`

## Docker

```bash
cd apps/frontend
docker compose up --build -d
```

- `Dockerfile`: `npm install --force`, exposes 8080.
- `docker-compose.yml`: mounts `.:/app` (delegated) + named volume for `node_modules`.
- `init.sh`: starts compose, waits for `node_modules`, copies from container to host.

## Key conventions

- Font Awesome 6 via CDN in `public/index.html` (not npm).
- `React.StrictMode` is **commented out** in `src/index.js`.
- `.env` vars: `PORT`, `REACT_APP_API_URL`, `REACT_APP_TMDB_TOKEN`.
