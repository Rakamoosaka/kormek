const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/$/,
    "",
  ) || "/api";

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
