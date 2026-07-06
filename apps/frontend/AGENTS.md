# AGENTS.md — KnowASong Frontend

## Quick start

```bash
npm start       # CRA dev server on port 8080 (http://localhost:8080)
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

- **App API** (localhost:3000): `src/Services/API/getFilms.js`, `getFilmSongs.js` — hardcoded `http://localhost:3000/api/...`
- **TMDB API**: `src/Services/API/getTMDBDataMethods.js` — hardcoded bearer token in source
- **YouTube**: `react-player` in `src/Components/Song/Player.jsx`

## Docker

- `Dockerfile`: `npm install --force`, exposes 8080.
- `docker-compose.yml`: mounts `.:/app` (delegated) + named volume for `node_modules`.
- `init.sh`: starts compose, waits for `node_modules`, copies from container to host.

## Stale files

- `src/Pages/Genre.jsx` and `src/Pages/UserSettings.jsx` are **empty** — not wired in router.
- `src/Services/integrations/YouTubePlayer.js` is **dead code** — the app uses `react-player` instead.

## Key conventions

- Font Awesome 6 via CDN in `public/index.html` (not npm).
- `React.StrictMode` is **commented out** in `src/index.js`.
- No `.env` beyond `PORT=8080` — API base URLs and TMDB token are hardcoded in source.
