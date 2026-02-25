import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react";
import { useRoomStore } from "../store/useRoomStore";
import { getRoom } from "../hooks/api";
import VideoPlayer from "../components/VideoPlayer";
import ChatSidebar from "../components/ChatSidebar";
import VideoCallGrid from "../components/VideoCallGrid";
import ShareModal from "../components/ShareModal";
import YouTubeSearch from "../components/YouTubeSearch";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const username = searchParams.get("username") || "anon";
  const hostFlag = searchParams.get("host") === "1";

  const { room, peers, setRoom, setUsername, setIsHost, connect, disconnect } =
    useRoomStore();

  const [showShare, setShowShare] = useState(false);

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
      <div className="min-h-screen bg-eggshell flex items-center justify-center">
        <p className="font-display text-2xl text-black/30 animate-pulse">
          Joining room…
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-eggshell overflow-hidden">
      {/* Share modal */}
      {showShare && room && (
        <ShareModal roomId={room.id} onClose={() => setShowShare(false)} />
      )}

      {/* ── Top bar ──────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/10 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="text-xs font-medium tracking-widest uppercase text-black/40 hover:text-black transition-colors cursor-pointer"
          >
            &larr; Home
          </button>
          <div className="w-px h-5 bg-black/10" />
          <h1 className="font-display text-2xl md:text-3xl text-black tracking-tight">
            {room.name}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium tracking-widest uppercase border border-black/15 rounded-lg text-black/50 hover:text-black hover:border-black/30 transition-colors cursor-pointer"
          >
            <Share2 size={14} />
            Share
          </button>
          <span className="text-xs font-medium tracking-widest uppercase text-black/40 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green" />
            {peers.length} online
          </span>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Video area */}
        <main className="flex-1 min-w-0 min-h-0 p-4 flex flex-col gap-3">
          <div className="flex-1 min-h-0">
            <VideoPlayer />
          </div>
          <YouTubeSearch />
        </main>

        {/* Sidebar — Call + Chat */}
        <aside className="w-full h-[45vh] lg:h-auto lg:w-90 bg-ivory flex flex-col border-l border-black/10 shrink-0">
          {/* Video call area */}
          <div className="h-52 lg:h-64 border-b border-black/10 shrink-0">
            <VideoCallGrid />
          </div>

          {/* Chat fills remaining space */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ChatSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}
