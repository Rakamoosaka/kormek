import { type FormEvent, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { searchYouTube, updateRoomMedia } from "../hooks/api";
import { useRoomStore } from "../store/useRoomStore";
import type { YouTubeResult } from "../types";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function YouTubeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YouTubeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const room = useRoomStore((s) => s.room);
  const isHost = useRoomStore((s) => s.isHost);
  const setMediaUrl = useRoomStore((s) => s.setMediaUrl);
  const send = useRoomStore((s) => s.send);

  if (!isHost) return null;

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const data = await searchYouTube(query);
      setResults(data);
      setSearched(true);
    } catch {
      setError("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (video: YouTubeResult) => {
    if (!room) return;
    try {
      await updateRoomMedia(room.id, video.url);
      setMediaUrl(video.url);
      // Notify all peers about the media change
      send({ type: "MEDIA_CHANGE", mediaUrl: video.url });
      setResults([]);
      setQuery("");
    } catch {
      setError("Failed to set video. Try again.");
    }
  };

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search YouTube…"
            className="w-full pl-9 pr-3 py-2.5 bg-ivory rounded-lg border border-black/10 text-sm text-black placeholder:text-black/30 outline-none focus:border-green transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-green text-white text-sm font-medium rounded-lg hover:bg-green/90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
        </button>
      </form>

      {error && <p className="text-xs text-amaranth">{error}</p>}

      {searched && !loading && !error && results.length === 0 && (
        <p className="text-xs text-black/60">
          No results found right now. Try another query.
        </p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="max-h-80 overflow-y-auto space-y-2 rounded-lg border border-black/10 bg-ivory p-2">
          {results.map((video) => (
            <button
              key={video.video_id}
              onClick={() => handleSelect(video)}
              className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-eggshell transition-colors text-left cursor-pointer"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-28 h-16 object-cover rounded shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-black leading-tight line-clamp-2">
                  {video.title}
                </p>
                <p className="text-xs text-black/50 mt-1">
                  {video.channel} &bull; {formatDuration(video.duration)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
