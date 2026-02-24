# Kormek

Kormek is a **watch party** app where people join a room and consume media together in sync, with real-time chat and built-in voice/video calling.

## What is implemented

### Core product goals

- **Media player** for room media URLs (YouTube/file URLs via `react-player`)
- **Host-driven sync engine** (PLAY/PAUSE/SEEK events propagated in real time)
- **Room chat** over WebSocket
- **WebRTC call** with signaling over the same room WebSocket
- **Meeting lifecycle UX**:
  - Host sees **Start Meeting**
  - Non-host sees **Join Meeting** only after host starts

### Tech stack

- **Backend**: FastAPI + SQLModel + PostgreSQL + WebSocket routing
- **Frontend**: React + Vite + TypeScript + Zustand + Tailwind CSS + React Player + native WebRTC APIs
- **DB runtime**: PostgreSQL via Docker Compose

---

## Project structure

```text
Kormek/
├── docker-compose.yml
├── backend/
│   ├── pyproject.toml
│   ├── .env
│   └── app/
│       ├── main.py
│       ├── api/
│       │   ├── rooms.py
│       │   └── ws.py
│       ├── sockets/
│       │   └── manager.py
│       ├── models/
│       │   └── models.py
│       └── core/
│           ├── config.py
│           └── database.py
└── frontend/
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── components/
        ├── hooks/
        ├── pages/
        ├── store/
        └── types.ts
```

---

## Architecture overview

### Backend

- `POST /api/rooms/` creates a room
- `GET /api/rooms/{room_id}` fetches room metadata
- `WS /ws/{room_id}/{username}` handles all real-time room messages

### WebSocket payloads

- `CHAT` → broadcast text message to room
- `SYNC` → host playback sync events (`PLAY`, `PAUSE`, `SEEK`)
- `SIGNAL` → targeted WebRTC offer/answer/ICE to a specific peer
- `MEETING` → room-level meeting lifecycle (`START`, `END`)

### Frontend flow

- Zustand store keeps room state, playback state, peers, meeting state, chat, and WS instance
- `VideoPlayer` is controlled by sync state and host events
- `ChatSidebar` reads/writes `CHAT` messages in real time
- `VideoCallGrid` uses native WebRTC + signaling from `SIGNAL`

---

## Prerequisites

- **Docker Desktop** running
- **Node.js** 18+
- **Python** matching backend project (`>=3.12,<3.13` in current `pyproject.toml`)
- **uv** package manager installed

---

## Environment configuration

Backend env file (`backend/.env`):

```env
DATABASE_URL=postgresql://kormek:kormek_secret@localhost:5433/kormek
```

> Note: PostgreSQL is mapped to host port **5433** to avoid conflicts with local PostgreSQL on `5432`.

Frontend env file for production (`frontend/.env`):

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_WS_BASE_URL=wss://your-api-domain.com
```

Use included examples:

- `backend/.env.example`
- `frontend/.env.example`

---

## Install dependencies

### Backend

```bash
cd backend
uv sync
```

### Frontend

```bash
cd frontend
npm install
```

---

## How to run

### Recommended: one command (Docker runs everything)

```bash
cd Kormek
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend docs: `http://localhost:8000/docs`

### Stop all services

```bash
cd Kormek
docker compose down
```

### Full reset (including DB data)

```bash
cd Kormek
docker compose down -v
```

### Manual mode (without full Docker stack)

Open separate terminals.

#### 1) Start PostgreSQL (Docker)

```bash
cd Kormek
docker compose up -d db
```

#### 2) Start backend

```bash
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Backend docs: `http://localhost:8000/docs`

#### 3) Start frontend

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`

---

## How to stop

### Manual mode: stop frontend/backend dev servers

- In each running terminal, press `Ctrl + C`

### Stop PostgreSQL container

```bash
cd Kormek
docker compose down
```

### Stop and remove DB volume (full reset)

```bash
cd Kormek
docker compose down -v
```

---

## How to test

## Quick health checks

### Backend API health

```bash
curl http://localhost:8000/openapi.json
```

### Type-check frontend

```bash
cd frontend
npx tsc --noEmit
```

### Python syntax check (example)

```bash
cd backend
uv run python -m py_compile app/sockets/manager.py
```

---

## Manual functional test plan

Use at least **2 browser tabs/windows** (or 3 for multi-peer call testing).

### A) Room creation

1. Open `http://localhost:5173`
2. Enter username + room name
3. Create room
4. Confirm room view loads and URL contains room id

### B) Playback sync (host controls)

1. In second tab, join same room with a different username
2. On host tab: play, pause, seek
3. Confirm non-host mirrors playback state and timestamp

### C) Chat

1. Send messages from both tabs
2. Confirm messages are visible in both clients in real time
3. On small screens, confirm chat scrolls and does not push video out of view

### D) Meeting/call lifecycle

1. Host should see **Start Meeting**
2. Non-host should see waiting text (no Join button yet)
3. Host clicks **Start Meeting**
4. Non-host now sees **Join Meeting**
5. Both join and verify remote video/audio appears
6. Host ends own call; meeting remains active for others to join/rejoin

### E) Multi-peer call layout (3+ users)

1. Join with 3 tabs/users
2. Start/join meeting from all users
3. Confirm call panel stays constrained and main video area is not collapsed

---

## UX/Design notes

Tailwind palette is configured with the Kormek theme colors:

- `kormek-bg` `#25274D`
- `kormek-surface` `#464866`
- `kormek-text` `#AAABB8`
- `kormek-primary` `#2E9CCA`
- `kormek-secondary` `#29648A`

The layout targets a theater-style experience:

- Main video area as primary focus
- Sidebar for call/chat
- Minimal dark UI with soft rounded surfaces

---

## Troubleshooting

### Docker DB not reachable

- Ensure Docker Desktop is running
- Verify container status:

```bash
docker compose ps
```

### Backend fails to start due to DB auth/port

- Confirm `backend/.env` uses port `5433`
- Confirm `docker-compose.yml` maps `5433:5432`

### WebRTC no remote media

- Confirm browser microphone/camera permissions are allowed
- Test with different browsers/profiles to avoid shared-device constraints
- Ensure both users are in same room and meeting has been started by host

### Port conflicts

- Frontend default: `5173`
- Backend default: `8000`
- Postgres via Docker: `5433`

### Production API/WS URL configuration

- In development, Vite proxy handles `/api` and `/ws`
- In production, set:
  - `VITE_API_BASE_URL`
  - `VITE_WS_BASE_URL`

Otherwise frontend requests will not know where to reach backend services.

---

## Deployment

### Recommended first deployment

- Deploy backend + managed Postgres + static frontend on Render.
- A starter `render.yaml` is included at project root.

### Render quick steps

1. Push repository to GitHub
2. In Render, create Blueprint and point to this repo
3. Review generated services from `render.yaml`
4. After deploy, update backend `CORS_ORIGINS` with actual frontend URL if needed
5. Confirm:
   - Backend health: `/healthz`
   - Frontend room creation and websocket connection

---

## Suggested next improvements

- Host-only explicit **End Meeting** button (separate from end-call)
- Persist chat history per room in DB
- Add room auth/invite tokens
- Add automated integration tests for WS sync and signaling
- Add TURN server for robust NAT traversal in production

---

## Contributing

### Branch naming

- `feat/<short-feature-name>`
- `fix/<short-bug-name>`
- `chore/<short-task-name>`

Examples:

- `feat/meeting-lifecycle`
- `fix/nonhost-seek-pause`
- `chore/readme-cleanup`

### Commit style

Use clear, scoped commits:

- `feat(room): add host-controlled meeting lifecycle`
- `fix(sync): preserve non-host play state on SEEK`
- `docs(readme): add run/stop/test instructions`

Keep commits focused: one logical change per commit when possible.

### Pull request checklist

- [ ] Rebased/updated branch from latest main
- [ ] App runs locally (frontend + backend + docker db)
- [ ] Type checks pass (`npx tsc --noEmit`)
- [ ] Backend starts cleanly (`uv run uvicorn app.main:app --port 8000`)
- [ ] Manual test done for impacted flows (sync/chat/call)
- [ ] README/docs updated if behavior changed

### Code guidelines for this project

- Keep UI minimal and consistent with Kormek palette
- Prefer simple solutions (KISS) and avoid duplication (DRY)
- Keep WebSocket message contracts explicit and version-safe
- Fix root causes instead of adding UI-only workarounds

---

## License

No license specified yet.
