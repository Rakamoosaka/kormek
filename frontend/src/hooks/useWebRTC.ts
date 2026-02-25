import { useCallback, useEffect, useRef, useState } from "react";
import { useRoomStore, onSignal } from "../store/useRoomStore";
import type { SignalMessage } from "../types";

/* -----------------------------------------------------------------
 *  Types
 * --------------------------------------------------------------- */
export interface PeerStream {
  username: string;
  stream: MediaStream;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

/* -----------------------------------------------------------------
 *  Hook: useWebRTC
 *
 *  Manages local media, peer connections for every room participant,
 *  and signaling via the existing WebSocket (SIGNAL messages).
 * --------------------------------------------------------------- */
export function useWebRTC() {
  const sendSignal = useRoomStore((s) => s.sendSignal);
  const peers = useRoomStore((s) => s.peers);
  const username = useRoomStore((s) => s.username);
  const ws = useRoomStore((s) => s.ws);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<PeerStream[]>([]);
  const [callActive, setCallActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Ref mirrors localStream state to avoid stale closures in callbacks
  const localStreamRef = useRef<MediaStream | null>(null);

  // Map<peerUsername, RTCPeerConnection>
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const shouldInitiate = useCallback(
    (peerName: string) => username.localeCompare(peerName) < 0,
    [username],
  );

  /* ---------- helpers ---------- */
  const addRemoteStream = useCallback(
    (peerName: string, stream: MediaStream) => {
      setRemoteStreams((prev) => {
        // Deduplicate
        const filtered = prev.filter((p) => p.username !== peerName);
        return [...filtered, { username: peerName, stream }];
      });
    },
    [],
  );

  const removeRemoteStream = useCallback((peerName: string) => {
    setRemoteStreams((prev) => prev.filter((p) => p.username !== peerName));
  }, []);

  const createPeerConnection = useCallback(
    (peerName: string, stream: MediaStream): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add our local tracks
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // When we get a remote track
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        if (remoteStream) addRemoteStream(peerName, remoteStream);
      };

      // ICE candidates → send via signaling
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal(peerName, {
            type: "ice-candidate",
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          closePeer(peerName);
        }
      };

      pcsRef.current.set(peerName, pc);
      return pc;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sendSignal, addRemoteStream],
  );

  const closePeer = useCallback(
    (peerName: string) => {
      const pc = pcsRef.current.get(peerName);
      if (pc) {
        pc.close();
        pcsRef.current.delete(peerName);
      }
      removeRemoteStream(peerName);
    },
    [removeRemoteStream],
  );

  /* ---------- Incoming signals ---------- */
  useEffect(() => {
    const unsubscribe = onSignal(async (msg: SignalMessage) => {
      const senderName = msg.sender!;
      const signal = msg.signal as Record<string, unknown>;
      const stream = localStream;
      if (!stream) return;

      let pc = pcsRef.current.get(senderName);

      if (signal.type === "offer") {
        // Receiver side: always accept offer, recreating conflicted/stale PC.
        if (pc && pc.signalingState !== "stable") {
          closePeer(senderName);
          pc = undefined;
        }
        if (!pc) {
          pc = createPeerConnection(senderName, stream);
        }

        await pc.setRemoteDescription(
          new RTCSessionDescription(
            signal as unknown as RTCSessionDescriptionInit,
          ),
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal(senderName, answer);
      } else if (signal.type === "answer") {
        if (pc && pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(
            new RTCSessionDescription(
              signal as unknown as RTCSessionDescriptionInit,
            ),
          );
        }
      } else if (signal.type === "ice-candidate") {
        if (pc) {
          await pc.addIceCandidate(
            new RTCIceCandidate(signal.candidate as RTCIceCandidateInit),
          );
        }
      }
    });

    return unsubscribe;
  }, [localStream, createPeerConnection, closePeer, sendSignal]);

  /* ---------- When peer list changes, initiate offers to new peers ---------- */
  useEffect(() => {
    if (!callActive || !localStream || !ws) return;

    const currentPCs = pcsRef.current;
    const otherPeers = peers.filter((p) => p !== username);

    // Create offers for peers we should initiate with (deterministic initiator)
    for (const peerName of otherPeers) {
      if (!currentPCs.has(peerName) && shouldInitiate(peerName)) {
        (async () => {
          const pc = createPeerConnection(peerName, localStream);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          sendSignal(peerName, offer);
        })();
      }
    }

    // Clean up peers that left
    for (const [name] of currentPCs) {
      if (!otherPeers.includes(name)) {
        closePeer(name);
      }
    }
  }, [
    peers,
    callActive,
    localStream,
    ws,
    username,
    shouldInitiate,
    createPeerConnection,
    closePeer,
    sendSignal,
  ]);

  /* ---------- Public controls ---------- */
  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      setCallActive(true);
    } catch (err) {
      console.error("Failed to get media devices:", err);
    }
  }, []);

  const endCall = useCallback(() => {
    // Close all peer connections
    for (const [name] of pcsRef.current) {
      closePeer(name);
    }
    // Stop local tracks
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStreams([]);
    setCallActive(false);
  }, [closePeer]);

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const newEnabled = !stream.getAudioTracks()[0]?.enabled;
    stream.getAudioTracks().forEach((t) => {
      t.enabled = newEnabled;
    });
    setAudioEnabled(newEnabled);
  }, []);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const newEnabled = !stream.getVideoTracks()[0]?.enabled;
    stream.getVideoTracks().forEach((t) => {
      t.enabled = newEnabled;
    });
    setVideoEnabled(newEnabled);
  }, []);

  /* ---------- Cleanup on unmount ---------- */
  useEffect(() => {
    return () => {
      for (const [, pc] of pcsRef.current) pc.close();
      pcsRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    };
  }, []);

  return {
    localStream,
    remoteStreams,
    callActive,
    audioEnabled,
    videoEnabled,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };
}
