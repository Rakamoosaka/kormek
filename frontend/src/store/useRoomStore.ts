import { create } from "zustand";
import type {
  ChatMessage,
  MeetingMessage,
  Room,
  SignalMessage,
  SyncMessage,
  WSMessage,
} from "../types";

// Simple event emitter for signaling — lets useWebRTC hook subscribe
type SignalHandler = (msg: SignalMessage) => void;
const signalListeners = new Set<SignalHandler>();
export const onSignal = (handler: SignalHandler) => {
  signalListeners.add(handler);
  return () => {
    signalListeners.delete(handler);
  };
};

/* -----------------------------------------------------------------
 *  State shape
 * --------------------------------------------------------------- */
interface RoomState {
  // Room metadata
  room: Room | null;
  username: string;
  isHost: boolean;

  // Media sync state
  mediaUrl: string | null;
  isPlaying: boolean;
  currentTime: number;

  // Peers
  peers: string[];

  // Chat
  messages: ChatMessage[];

  // WebSocket
  ws: WebSocket | null;

  // Meeting lifecycle (controls call join visibility)
  meetingStarted: boolean;
}

/* -----------------------------------------------------------------
 *  Actions
 * --------------------------------------------------------------- */
interface RoomActions {
  // Setters
  setRoom: (room: Room) => void;
  setUsername: (username: string) => void;
  setIsHost: (isHost: boolean) => void;
  setMediaUrl: (url: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setPeers: (peers: string[]) => void;

  // WebSocket lifecycle
  connect: (roomId: string, username: string) => void;
  disconnect: () => void;
  send: (msg: WSMessage) => void;

  // Host-only: broadcast sync events
  syncPlay: (time: number) => void;
  syncPause: (time: number) => void;
  syncSeek: (time: number) => void;

  // Chat
  sendChat: (text: string) => void;

  // Signaling (WebRTC)
  sendSignal: (target: string, signal: unknown) => void;

  // Meeting lifecycle
  startMeeting: () => void;
  endMeeting: () => void;
}

export type RoomStore = RoomState & RoomActions;

/* -----------------------------------------------------------------
 *  Store
 * --------------------------------------------------------------- */
export const useRoomStore = create<RoomStore>()((set, get) => ({
  // ---------- initial state ----------
  room: null,
  username: "",
  isHost: false,
  mediaUrl: null,
  isPlaying: false,
  currentTime: 0,
  peers: [],
  messages: [],
  ws: null,
  meetingStarted: false,

  // ---------- setters ----------
  setRoom: (room) => set({ room, mediaUrl: room.media_url }),
  setUsername: (username) => set({ username }),
  setIsHost: (isHost) => set({ isHost }),
  setMediaUrl: (url) => set({ mediaUrl: url }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setPeers: (peers) => set({ peers }),

  // ---------- WebSocket ----------
  connect: (roomId, username) => {
    const wsBase = (
      import.meta.env.VITE_WS_BASE_URL as string | undefined
    )?.replace(/\/$/, "");
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = wsBase
      ? `${wsBase}/ws/${roomId}/${encodeURIComponent(username)}`
      : `${protocol}://${window.location.host}/ws/${roomId}/${encodeURIComponent(username)}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      set({ ws });
    };

    ws.onmessage = (event) => {
      const msg: WSMessage = JSON.parse(event.data);
      const state = get();

      switch (msg.type) {
        case "CHAT":
          set({ messages: [...state.messages, msg] });
          break;

        case "SYNC":
          // Only non-hosts react to SYNC messages
          if (!state.isHost) {
            set((current) => ({
              isPlaying:
                msg.action === "PLAY"
                  ? true
                  : msg.action === "PAUSE"
                    ? false
                    : current.isPlaying,
              currentTime: msg.currentTime,
            }));
          }
          break;

        case "PEER_JOINED":
        case "PEER_LEFT":
          set({ peers: msg.peers });
          break;

        case "SIGNAL":
          // Dispatch to WebRTC hook listeners
          signalListeners.forEach((fn) => fn(msg));
          break;

        case "MEETING":
          set({ meetingStarted: msg.action === "START" });
          break;

        case "INIT":
          set({
            peers: msg.peers,
            meetingStarted: msg.meetingStarted,
            messages: msg.chatHistory || [],
          });
          break;
      }
    };

    ws.onclose = () => set({ ws: null });
  },

  disconnect: () => {
    get().ws?.close();
    set({ ws: null, messages: [], peers: [], meetingStarted: false });
  },

  send: (msg) => {
    const { ws } = get();
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  },

  // ---------- sync helpers (host only) ----------
  syncPlay: (time) => {
    const msg: SyncMessage = {
      type: "SYNC",
      action: "PLAY",
      currentTime: time,
    };
    get().send(msg);
    set({ isPlaying: true, currentTime: time });
  },

  syncPause: (time) => {
    const msg: SyncMessage = {
      type: "SYNC",
      action: "PAUSE",
      currentTime: time,
    };
    get().send(msg);
    set({ isPlaying: false, currentTime: time });
  },

  syncSeek: (time) => {
    const msg: SyncMessage = {
      type: "SYNC",
      action: "SEEK",
      currentTime: time,
    };
    get().send(msg);
    set({ currentTime: time });
  },

  // ---------- chat ----------
  sendChat: (text) => {
    if (!text.trim()) return;
    get().send({ type: "CHAT", text });
  },

  // ---------- signaling ----------
  sendSignal: (target, signal) => {
    get().send({ type: "SIGNAL", target, signal });
  },

  // ---------- meeting lifecycle ----------
  startMeeting: () => {
    const msg: MeetingMessage = {
      type: "MEETING",
      action: "START",
    };
    get().send(msg);
    set({ meetingStarted: true });
  },

  endMeeting: () => {
    const msg: MeetingMessage = {
      type: "MEETING",
      action: "END",
    };
    get().send(msg);
    set({ meetingStarted: false });
  },
}));
