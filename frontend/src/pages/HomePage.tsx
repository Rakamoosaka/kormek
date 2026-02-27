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
    <div className="min-h-screen flex flex-col bg-eggshell">
      {createdRoomId && (
        <ShareModal roomId={createdRoomId} onClose={handleShareClose} />
      )}

      <header className="px-4 py-5 sm:px-6 md:px-12 lg:px-20">
        <span className="text-sm font-medium tracking-widest uppercase text-black/60">
          Kormek &bull; Watch Party
        </span>
      </header>

      <main className="flex-1">
        <section className="px-4 sm:px-6 md:px-12 lg:px-20 min-h-[56vh] sm:min-h-[60vh] md:min-h-[64vh] flex items-center justify-center py-8 sm:py-10 md:py-12">
          <div className="w-full max-w-4xl text-center">
            <p className="font-display text-[clamp(2.4rem,11vw,7.2rem)] leading-[0.9] tracking-tight text-black px-2">
              WATCH TOGETHER,
              <br />
              ANYWHERE
            </p>

            <form
              onSubmit={handleCreate}
              className="mt-8 sm:mt-10 max-w-2xl mx-auto flex flex-col gap-3 sm:gap-4"
            >
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your display name"
                className="w-full bg-transparent border-b-2 border-black/20 px-1 py-3 text-base sm:text-lg text-black placeholder:text-black/35 outline-none focus:border-green transition-colors"
              />
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Room name (e.g. Friday movie night)"
                className="w-full bg-transparent border-b-2 border-black/20 px-1 py-3 text-base sm:text-lg text-black placeholder:text-black/35 outline-none focus:border-amaranth transition-colors"
              />
              <button
                type="submit"
                className="mt-3 sm:mt-4 w-full sm:w-auto sm:mx-auto bg-amaranth text-white font-display text-2xl sm:text-3xl tracking-wide px-8 sm:px-10 py-3 hover:bg-black transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!username.trim() || !roomName.trim()}
              >
                Create your room
              </button>
            </form>

            <p className="mt-4 sm:mt-5 text-black/55 text-base sm:text-lg">
              (No account required)
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 md:px-12 lg:px-20 pb-10 sm:pb-12">
          <form
            onSubmit={handleJoin}
            className="max-w-3xl mx-auto border border-black/15 bg-ivory/45 p-4 sm:p-5 md:p-7 flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch"
          >
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Have a room code? Paste it here"
              className="flex-1 bg-transparent border-b-2 border-black/20 px-1 py-3 text-base sm:text-lg text-black placeholder:text-black/35 outline-none focus:border-green transition-colors"
            />
            <button
              type="submit"
              className="shrink-0 w-full md:w-auto bg-green text-white font-display text-xl sm:text-2xl tracking-wide px-6 sm:px-8 py-3 hover:bg-black transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!username.trim() || !joinCode.trim()}
            >
              Join room
            </button>
          </form>
        </section>

        <section className="bg-black px-4 sm:px-6 py-12 sm:py-14 md:px-12 lg:px-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-start">
            <div>
              <h2 className="text-white font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
                About Kormek
              </h2>
              <p className="mt-5 sm:mt-6 text-white/85 text-lg sm:text-xl leading-relaxed max-w-xl">
                Create a watch room and enjoy synced playback with friends in
                real-time. Chat while you watch, start voice/video calls, and
                search YouTube without leaving your room.
              </p>
            </div>

            <ul className="space-y-4 sm:space-y-5 text-white text-xl sm:text-2xl md:text-3xl font-semibold">
              <li className="flex gap-4 items-start">
                <span className="text-green">✓</span>
                <span>Synchronized video playback</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-green">✓</span>
                <span>Real-time chat with your friends</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-green">✓</span>
                <span>Built-in voice and video calls</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-green">✓</span>
                <span>YouTube search inside the room</span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="bg-black px-4 sm:px-6 md:px-12 lg:px-20 py-5 sm:py-6 flex flex-col sm:flex-row gap-2 sm:gap-0 items-start sm:items-center justify-between border-t border-white/10">
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
