const API_BASE_URL = (() => {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!raw) return "/api";

  const normalized = raw.replace(/\/$/, "");

  try {
    const parsed = new URL(normalized);
    if (parsed.pathname === "" || parsed.pathname === "/") {
      return `${normalized}/api`;
    }
  } catch {
    return normalized;
  }

  return normalized;
})();

export async function createRoom(name: string, mediaUrl?: string) {
  const res = await fetch(`${API_BASE_URL}/rooms/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, media_url: mediaUrl || null }),
  });
  if (!res.ok) throw new Error("Failed to create room");
  return res.json();
}

export async function getRoom(roomId: string) {
  const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
  if (!res.ok) throw new Error("Room not found");
  return res.json();
}

export async function updateRoomMedia(roomId: string, mediaUrl: string) {
  const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/media`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ media_url: mediaUrl }),
  });
  if (!res.ok) throw new Error("Failed to update media");
  return res.json();
}

export async function searchYouTube(query: string, limit = 10) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`${API_BASE_URL}/youtube/search?${params}`);
  if (!res.ok) throw new Error("YouTube search failed");
  return res.json();
}
