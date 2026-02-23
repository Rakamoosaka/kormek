/* ---------------------------------------------------------------
 * Shared TypeScript types for Kormek
 * ------------------------------------------------------------- */

/** Room as returned by the REST API */
export interface Room {
  id: string;
  name: string;
  media_url: string | null;
  host_id: string | null;
  is_playing: boolean;
  current_time: number;
  created_at: string;
}

/** Payload sent/received over the WebSocket */
export type WSMessage =
  | ChatMessage
  | SyncMessage
  | SignalMessage
  | PeerEvent
  | MeetingMessage;

export interface ChatMessage {
  type: "CHAT";
  sender?: string;
  text: string;
}

export interface SyncMessage {
  type: "SYNC";
  action: "PLAY" | "PAUSE" | "SEEK";
  currentTime: number;
}

export interface SignalMessage {
  type: "SIGNAL";
  sender?: string;
  target: string;
  signal: unknown; // RTCSessionDescription | RTCIceCandidate
}

export interface PeerEvent {
  type: "PEER_JOINED" | "PEER_LEFT";
  username: string;
  peers: string[];
}

export interface MeetingMessage {
  type: "MEETING";
  action: "START" | "END";
  sender?: string;
}
