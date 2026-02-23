"""
Unified WebSocket ConnectionManager for Kormek.

Handles payload types over a single WS connection per client:
  - CHAT     → broadcast text messages to everyone in the room
  - SYNC     → host sends play/pause/seek; server relays to all peers
  - SIGNAL   → WebRTC signaling (offer/answer/ice) forwarded to a target peer
    - MEETING  → host starts/ends meeting visibility for call join controls

Every JSON message on the socket MUST include a top-level `type` field.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field

from fastapi import WebSocket

logger = logging.getLogger(__name__)

# Recognised payload types
CHAT = "CHAT"
SYNC = "SYNC"
SIGNAL = "SIGNAL"
MEETING = "MEETING"


@dataclass
class Peer:
    """Represents a single connected user in a room."""
    ws: WebSocket
    username: str


class ConnectionManager:
    """Room-scoped WebSocket manager (singleton-ish, one per app)."""

    def __init__(self) -> None:
        # room_id → {username: Peer}
        self._rooms: dict[str, dict[str, Peer]] = {}

    # ------------------------------------------------------------------
    # Connection lifecycle
    # ------------------------------------------------------------------
    async def connect(self, room_id: str, username: str, ws: WebSocket) -> None:
        await ws.accept()
        room = self._rooms.setdefault(room_id, {})
        room[username] = Peer(ws=ws, username=username)
        logger.info("WS connect: %s joined room %s", username, room_id)

    def disconnect(self, room_id: str, username: str) -> None:
        room = self._rooms.get(room_id)
        if room:
            room.pop(username, None)
            if not room:
                del self._rooms[room_id]
        logger.info("WS disconnect: %s left room %s", username, room_id)

    def get_peers(self, room_id: str) -> list[str]:
        """Return usernames currently in a room."""
        return list(self._rooms.get(room_id, {}).keys())

    # ------------------------------------------------------------------
    # Messaging helpers
    # ------------------------------------------------------------------
    async def _send_json(self, ws: WebSocket, data: dict) -> None:
        try:
            await ws.send_json(data)
        except Exception:
            logger.warning("Failed to send to a peer; ignoring.")

    async def broadcast(self, room_id: str, data: dict, *, exclude: str | None = None) -> None:
        """Send `data` to every peer in the room except `exclude`."""
        for uname, peer in self._rooms.get(room_id, {}).items():
            if uname != exclude:
                await self._send_json(peer.ws, data)

    async def send_to(self, room_id: str, target: str, data: dict) -> None:
        """Send `data` to a specific peer by username."""
        peer = self._rooms.get(room_id, {}).get(target)
        if peer:
            await self._send_json(peer.ws, data)

    # ------------------------------------------------------------------
    # Main dispatch loop — called once per connected client
    # ------------------------------------------------------------------
    async def handle(self, room_id: str, username: str, ws: WebSocket) -> None:
        """Read messages forever and dispatch by `type`."""
        try:
            while True:
                raw = await ws.receive_text()
                msg: dict = json.loads(raw)
                msg_type = msg.get("type")

                if msg_type == CHAT:
                    # Attach sender, then broadcast to room (including sender for echo)
                    msg["sender"] = username
                    await self.broadcast(room_id, msg)

                elif msg_type == SYNC:
                    # Only the host should send SYNC; relay to everyone else
                    await self.broadcast(room_id, msg, exclude=username)

                elif msg_type == SIGNAL:
                    # Forward to the specific target peer
                    target = msg.get("target")
                    if target:
                        msg["sender"] = username
                        await self.send_to(room_id, target, msg)

                elif msg_type == MEETING:
                    # Host controls meeting lifecycle; reflect to everyone.
                    msg["sender"] = username
                    await self.broadcast(room_id, msg)

                else:
                    logger.warning("Unknown WS message type: %s", msg_type)

        except Exception:
            # WebSocketDisconnect or any parse error → clean up
            self.disconnect(room_id, username)


# Single shared instance imported by the app
manager = ConnectionManager()
