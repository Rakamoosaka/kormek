import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../hooks/api";
import ShareModal from "../components/ShareModal";

export default function HomePage() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [username, setUsername] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !username.trim()) return;
    const room = await createRoom(roomName);
    setCreatedRoomId(room.id);
  };

  const handleShareClose = () => {
    if (!createdRoomId) return;
    navigate(
      `/room/${createdRoomId}?username=${encodeURIComponent(username)}&host=1`,
    );
  };

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !username.trim()) return;
    navigate(`/room/${joinCode}?username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Share modal after room creation */}
      {createdRoomId && (
        <ShareModal roomId={createdRoomId} onClose={handleShareClose} />
      )}
      {/* ── Hero Section ─────────────────────────────── */}
      <header className="px-6 pt-12 pb-8 md:px-12 lg:px-20">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-16">
          <span className="text-sm font-medium tracking-widest uppercase text-black/60">
            Kormek &bull; Watch Party
          </span>
        </div>

        {/* Giant heading */}
        <h1 className="font-display text-[clamp(4rem,15vw,12rem)] leading-[0.85] text-black tracking-tight">
          KORMEK
        </h1>

        {/* Subtitle */}
        <p className="font-serif text-lg md:text-xl text-black/50 mt-4 max-w-md italic">
          Watch together, anywhere. Create a room or join one — your friends are
          waiting.
        </p>
      </header>

      {/* ── Username bar ─────────────────────────────── */}
      <div className="px-6 md:px-12 lg:px-20 pb-6">
        <label className="block text-xs font-medium tracking-widest uppercase text-black/50 mb-2">
          Your Name
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter a display name"
          className="w-full max-w-sm bg-transparent border-b-2 border-black/20 px-0 py-3 text-lg text-black placeholder:text-black/30 outline-none focus:border-green transition-colors"
        />
      </div>

      {/* ── Two-panel grid (Create / Join) ───────────── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
        {/* Create Room — Amaranth panel */}
        <form
          onSubmit={handleCreate}
          className="bg-amaranth p-8 md:p-12 lg:p-16 flex flex-col justify-between min-h-100"
        >
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-white/60">
              New Session
            </span>
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] text-white mt-2">
              CREATE
              <br />A ROOM
            </h2>
          </div>

          <div className="space-y-5 mt-8">
            <div>
              <label className="block text-xs font-medium tracking-widest uppercase text-white/60 mb-2">
                Room Name
              </label>
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Friday movie night"
                className="w-full bg-transparent border-b-2 border-white/30 px-0 py-3 text-white text-lg placeholder:text-white/40 outline-none focus:border-white transition-colors"
              />
            </div>
            <button
              type="submit"
              className="mt-4 border-2 border-white text-white font-display text-xl tracking-wider px-8 py-3 hover:bg-white hover:text-amaranth transition-colors cursor-pointer"
            >
              CREATE
            </button>
          </div>
        </form>

        {/* Join Room — Green panel */}
        <form
          onSubmit={handleJoin}
          className="bg-green p-8 md:p-12 lg:p-16 flex flex-col justify-between min-h-100"
        >
          <div>
            <span className="text-xs font-medium tracking-widest uppercase text-white/60">
              Existing Session
            </span>
            <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.9] text-white mt-2">
              JOIN
              <br />A ROOM
            </h2>
          </div>

          <div className="space-y-5 mt-8">
            <div>
              <label className="block text-xs font-medium tracking-widest uppercase text-white/60 mb-2">
                Room Code
              </label>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Paste room code here"
                className="w-full bg-transparent border-b-2 border-white/30 px-0 py-3 text-white text-lg placeholder:text-white/40 outline-none focus:border-white transition-colors"
              />
            </div>
            <button
              type="submit"
              className="mt-4 border-2 border-white text-white font-display text-xl tracking-wider px-8 py-3 hover:bg-white hover:text-green transition-colors cursor-pointer"
            >
              JOIN
            </button>
          </div>
        </form>
      </div>

      {/* ── Footer bar ───────────────────────────────── */}
      <footer className="bg-black px-6 md:px-12 lg:px-20 py-6 flex items-center justify-between">
        <span className="text-xs tracking-widest uppercase text-white/40">
          &copy; Kormek {new Date().getFullYear()}
        </span>
        <span className="text-xs tracking-widest uppercase text-white/40">
          Sync &bull; Chat &bull; Call
        </span>
      </footer>
    </div>
  );
}
