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
  | MeetingMessage
  | MediaChangeMessage
  | InitMessage;

export interface InitMessage {
  type: "INIT";
  peers: string[];
  meetingStarted: boolean;
  chatHistory: ChatMessage[];
}

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

export interface MediaChangeMessage {
  type: "MEDIA_CHANGE";
  mediaUrl: string;
  sender?: string;
}

/** YouTube search result from the backend */
export interface YouTubeResult {
  video_id: string;
  title: string;
  channel: string;
  duration: number;
  thumbnail: string;
  url: string;
}
