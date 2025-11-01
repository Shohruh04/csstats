# csstats

A small CS2 Game State Integration (GSI) stats collector and leaderboard.

This repository contains a lightweight backend (Express + better-sqlite3) that accepts CS2 GSI POSTs and stores simple per-player stats, plus a Vite + React frontend to display a leaderboard.

## Quick overview

- Backend: `backend/` — Express server using `better-sqlite3` (database: `cs2stats.db`).
- Frontend: `frontend/` — Vite + React + Tailwind UI.
- Example GSI config: `gamestate_integration_office.cfg` (included for local testing).

## Features

- Accepts CS2 GSI payloads (POST /gsi) and upserts player stats.
- Exposes a simple leaderboard API (GET /leaderboard).
- Small, dependency-light SQLite storage for quick local setups.

## Prerequisites

- Node.js (recommended >= 18)
- npm (comes with Node)

## Install

Install dependencies for both backend and frontend.

```bash
# from repo root
cd backend
npm install

cd ../frontend
npm install
```

## Running (development)

Open two terminals (backend and frontend).

Backend (dev with nodemon):

```bash
cd backend
npm run dev
# server listens on http://localhost:3001
```

Frontend (Vite dev server):

```bash
cd frontend
npm run dev
# frontend dev server default: http://localhost:5174
```

Once both are running, the frontend will call the backend's API at `http://localhost:3001` (CORS is configured for the Vite origin).

## Running (production / build)

Build the frontend and serve the backend normally.

```bash
cd frontend
npm run build
npm run preview  # optional local preview of the built frontend

# start backend in production
cd ../backend
npm start
```

## API

- GET / => basic health and list of endpoints
- POST /gsi => receive CS2 GSI JSON payloads (accepts single-player and `allplayers` blocks)
- GET /leaderboard => returns JSON list of players ordered by kills

Example: check backend health

```bash
curl http://localhost:3001/
```

## Using Game State Integration (CS2)

1. Place `gamestate_integration_office.cfg` (included) into your CS2 `cfg` folder (example path on Windows: `%ProgramFiles(x86)%\Steam\steamapps\common\Counter-Strike 2\game\cs2\cfg`).
2. Update the `uri` in the cfg file if you want to point to a remote server. For local testing, the default config will POST to `http://localhost:3001/gsi`.
3. Start the backend and frontend, then run a local game or GOTV to see stats reflected in the leaderboard.

## Project structure

```
./
├─ backend/          # Express server + SQLite DB
├─ frontend/         # Vite + React app
├─ gamestate_integration_office.cfg
```

## Contract (inputs / outputs)

- Input: CS2 GSI JSON (POST /gsi). Accepts either a `player` object or an `allplayers` map.
- Output: JSON responses { ok: true } on success; leaderboard returns `{ ok: true, players: [...] }`.
- Error modes: 400 for missing steamid in single-player payloads, 500 for unexpected server errors.

## Notes & edge cases

- The server stores players by `steamid` (string) and upserts on conflict.
- For GOTV / allplayers payloads, many entries may not contain valid steam IDs — those are skipped.
- Database file: `backend/cs2stats.db` (created automatically).

## Contributing

Contributions welcome. Open an issue or PR with a clear description of the change.

## License

This project is unlicensed by default. Add a `LICENSE` file if you want to specify one.

---

If you want, I can also add a short frontend README, a minimal Dockerfile for the backend, or a small Postman/HTTP example collection. Tell me which you'd like next.
