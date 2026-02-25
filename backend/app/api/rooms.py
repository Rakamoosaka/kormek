from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.models import Room, RoomCreate, RoomRead

router = APIRouter(prefix="/rooms", tags=["rooms"])


@router.post("/", response_model=RoomRead, status_code=status.HTTP_201_CREATED)
def create_room(payload: RoomCreate, session: Session = Depends(get_session)):
    room = Room.model_validate(payload)
    session.add(room)
    session.commit()
    session.refresh(room)
    return room


@router.get("/{room_id}", response_model=RoomRead)
def get_room(room_id: str, session: Session = Depends(get_session)):
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


class MediaUpdate(BaseModel):
    media_url: str | None


@router.patch("/{room_id}/media", response_model=RoomRead)
def update_room_media(
    room_id: str,
    payload: MediaUpdate,
    session: Session = Depends(get_session),
):
    """Update the media URL of a room (host action)."""
    room = session.get(Room, room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    room.media_url = payload.media_url
    room.is_playing = False
    room.current_time = 0.0
    session.add(room)
    session.commit()
    session.refresh(room)
    return room
