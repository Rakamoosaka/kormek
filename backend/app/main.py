from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import rooms, ws
from app.core.config import settings
from app.core.database import create_db_and_tables


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Startup / shutdown hook — create tables on boot."""
    create_db_and_tables()
    yield


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST routes
app.include_router(rooms.router, prefix="/api")

# WebSocket route
app.include_router(ws.router)


@app.get("/healthz", tags=["health"])
def healthz():
    return {"status": "ok", "service": settings.APP_NAME}
