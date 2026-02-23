import uuid
from datetime import datetime, timezone

from sqlmodel import Field, Relationship, SQLModel


# ---------------------------------------------------------------------------
# Room
# ---------------------------------------------------------------------------
class RoomBase(SQLModel):
    """Shared readable fields for a room."""
    name: str = Field(max_length=120, index=True)
    media_url: str | None = Field(default=None, max_length=2048)


class Room(RoomBase, table=True):
    """Persistent room record."""
    id: str = Field(
        default_factory=lambda: uuid.uuid4().hex[:8],
        primary_key=True,
        max_length=8,
    )
    host_id: str | None = Field(default=None, max_length=64)
    is_playing: bool = Field(default=False)
    current_time: float = Field(default=0.0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    participants: list["Participant"] = Relationship(back_populates="room")


class RoomCreate(RoomBase):
    """Payload accepted when creating a room."""
    pass


class RoomRead(RoomBase):
    """Payload returned to the client."""
    id: str
    host_id: str | None
    is_playing: bool
    current_time: float
    created_at: datetime


# ---------------------------------------------------------------------------
# Participant  (lightweight — tracks who is in a room right now)
# ---------------------------------------------------------------------------
class ParticipantBase(SQLModel):
    username: str = Field(max_length=60)


class Participant(ParticipantBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    room_id: str = Field(foreign_key="room.id", index=True)
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    room: Room | None = Relationship(back_populates="participants")


class ParticipantRead(ParticipantBase):
    id: int
    room_id: str
    joined_at: datetime
