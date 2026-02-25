from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.sockets.manager import manager

router = APIRouter()


@router.websocket("/ws/{room_id}/{username}")
async def ws_endpoint(websocket: WebSocket, room_id: str, username: str):
    await manager.connect(room_id, username, websocket)

    # Send initial state (peers, meeting status, chat history) to the new user
    await manager.send_init(room_id, username)

    # Notify the room about the new peer
    await manager.broadcast(
        room_id,
        {"type": "PEER_JOINED", "username": username, "peers": manager.get_peers(room_id)},
        exclude=username,
    )

    try:
        await manager.handle(room_id, username, websocket)
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(room_id, username)
        await manager.broadcast(
            room_id,
            {"type": "PEER_LEFT", "username": username, "peers": manager.get_peers(room_id)},
        )
