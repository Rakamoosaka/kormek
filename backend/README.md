# Kormek Backend

FastAPI backend for Kormek (rooms API + WebSocket real-time engine).

For full project documentation (architecture, full run/stop/test flow), see the root README:

- [../README.md](../README.md)

## Stack

- FastAPI
- SQLModel
- PostgreSQL
- Uvicorn
- WebSocket routing for `CHAT`, `SYNC`, `SIGNAL`, `MEETING`

## Prerequisites

- Python compatible with project (`>=3.12,<3.13`)
- `uv` installed
- PostgreSQL running (recommended via project Docker Compose)

## Install

```bash
cd backend
uv sync
```

## Run

```bash
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

API docs:

- http://localhost:8000/docs
- http://localhost:8000/healthz

## Stop

- Press `Ctrl + C` in the backend terminal.

## Dev checks

```bash
cd backend
uv run python -m py_compile app/sockets/manager.py
```

## Main paths

- App entry: `app/main.py`
- Rooms API: `app/api/rooms.py`
- WS endpoint: `app/api/ws.py`
- WS manager: `app/sockets/manager.py`
- Models: `app/models/models.py`
- DB config/session: `app/core/config.py`, `app/core/database.py`
