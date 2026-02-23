import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Film, Plus, LogIn } from "lucide-react";
import { createRoom } from "../hooks/api";

export default function HomePage() {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [username, setUsername] = useState("");

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !username.trim()) return;
    const room = await createRoom(roomName, mediaUrl || undefined);
    navigate(
      `/room/${room.id}?username=${encodeURIComponent(username)}&host=1`,
    );
  };

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !username.trim()) return;
    navigate(`/room/${joinCode}?username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <Film className="mx-auto h-12 w-12 text-kormek-primary" />
          <h1 className="text-3xl font-bold text-kormek-primary tracking-tight">
            Kormek
          </h1>
          <p className="text-kormek-text/60 text-sm">
            Watch together, anywhere.
          </p>
        </div>

        {/* Username (shared) */}
        <div>
          <label className="block text-sm mb-1">Your name</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter a display name"
            className="w-full rounded-lg bg-kormek-surface px-4 py-2.5 text-kormek-text placeholder:text-kormek-text/40 outline-none focus:ring-2 focus:ring-kormek-primary/50"
          />
        </div>

        {/* Create room */}
        <form
          onSubmit={handleCreate}
          className="bg-kormek-surface rounded-lg p-5 space-y-3"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5 text-kormek-primary" />
            Create a Room
          </h2>
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room name"
            className="w-full rounded-lg bg-kormek-bg px-4 py-2.5 text-kormek-text placeholder:text-kormek-text/40 outline-none focus:ring-2 focus:ring-kormek-primary/50"
          />
          <input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="YouTube URL or leave empty"
            className="w-full rounded-lg bg-kormek-bg px-4 py-2.5 text-kormek-text placeholder:text-kormek-text/40 outline-none focus:ring-2 focus:ring-kormek-primary/50"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-kormek-primary hover:bg-kormek-secondary text-white font-medium py-2.5 transition-colors cursor-pointer"
          >
            Create
          </button>
        </form>

        {/* Join room */}
        <form
          onSubmit={handleJoin}
          className="bg-kormek-surface rounded-lg p-5 space-y-3"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <LogIn className="h-5 w-5 text-kormek-primary" />
            Join a Room
          </h2>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Room code"
            className="w-full rounded-lg bg-kormek-bg px-4 py-2.5 text-kormek-text placeholder:text-kormek-text/40 outline-none focus:ring-2 focus:ring-kormek-primary/50"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-kormek-primary hover:bg-kormek-secondary text-white font-medium py-2.5 transition-colors cursor-pointer"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
