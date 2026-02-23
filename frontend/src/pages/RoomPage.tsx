import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useRoomStore } from "../store/useRoomStore";
import { getRoom } from "../hooks/api";
import VideoPlayer from "../components/VideoPlayer";
import ChatSidebar from "../components/ChatSidebar";
import VideoCallGrid from "../components/VideoCallGrid";
import { Users } from "lucide-react";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username") || "anon";
  const hostFlag = searchParams.get("host") === "1";

  const { room, peers, setRoom, setUsername, setIsHost, connect, disconnect } =
    useRoomStore();

  /* ---- Bootstrap: fetch room data, open WS ---- */
  useEffect(() => {
    if (!roomId) return;

    setUsername(username);
    setIsHost(hostFlag);

    getRoom(roomId).then((r) => {
      setRoom(r);
      connect(roomId, username);
    });

    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="animate-pulse text-kormek-text/50">Joining room…</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* ---------- Video area (≈75%) ---------- */}
      <main className="flex-1 min-w-0 min-h-0 p-3 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-2 px-1 shrink-0">
          <h1 className="text-lg font-semibold truncate">{room.name}</h1>
          <span className="text-xs bg-kormek-surface rounded-full px-3 py-1 flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {peers.length + 1}
          </span>
        </div>

        {/* Player */}
        <div className="flex-1 min-h-0">
          <VideoPlayer />
        </div>
      </main>

      {/* ---------- Sidebar (≈25%) — Call + Chat ---------- */}
      <aside className="w-full h-[45vh] lg:h-auto lg:w-[340px] bg-kormek-surface flex flex-col border-l border-kormek-bg/40 shrink-0">
        {/* Video call area */}
        <div className="h-52 lg:h-64 border-b border-kormek-bg/40 shrink-0">
          <VideoCallGrid />
        </div>

        {/* Chat fills remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatSidebar />
        </div>
      </aside>
    </div>
  );
}
