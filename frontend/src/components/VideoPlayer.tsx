import { useCallback, useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import { useRoomStore } from "../store/useRoomStore";

const SEEK_THRESHOLD = 2; // seconds — ignore small drift

export default function VideoPlayer() {
  const playerRef = useRef<HTMLVideoElement>(null);
  const seekingRef = useRef(false);
  // Guard: suppress events while we're programmatically syncing the non-host
  const syncingRef = useRef(false);

  const mediaUrl = useRoomStore((s) => s.mediaUrl);
  const isPlaying = useRoomStore((s) => s.isPlaying);
  const currentTime = useRoomStore((s) => s.currentTime);
  const isHost = useRoomStore((s) => s.isHost);
  const syncPlay = useRoomStore((s) => s.syncPlay);
  const syncPause = useRoomStore((s) => s.syncPause);
  const syncSeek = useRoomStore((s) => s.syncSeek);

  /* ----------------------------------------------------------------
   *  Non-host: seek to the correct timestamp on SYNC updates.
   *  Play/pause is handled declaratively via the `playing` prop.
   * -------------------------------------------------------------- */
  useEffect(() => {
    const player = playerRef.current;
    if (!player || isHost) return;

    const drift = Math.abs((player.currentTime || 0) - currentTime);
    if (drift > SEEK_THRESHOLD) {
      syncingRef.current = true;
      player.currentTime = currentTime;
      // Allow events again after the seek settles
      setTimeout(() => (syncingRef.current = false), 500);
    }
  }, [currentTime, isHost]);

  /* ----------------------------------------------------------------
   *  Host callbacks — broadcast changes to the room
   * -------------------------------------------------------------- */
  const handlePlay = useCallback(() => {
    if (!isHost || syncingRef.current) return;
    const t = playerRef.current?.currentTime ?? 0;
    syncPlay(t);
  }, [isHost, syncPlay]);

  const handlePause = useCallback(() => {
    if (!isHost || syncingRef.current || seekingRef.current) return;
    const t = playerRef.current?.currentTime ?? 0;
    syncPause(t);
  }, [isHost, syncPause]);

  const handleSeeking = useCallback(() => {
    if (!isHost) return;
    seekingRef.current = true;
  }, [isHost]);

  const handleSeeked = useCallback(() => {
    if (!isHost || syncingRef.current) return;
    const t = playerRef.current?.currentTime ?? 0;
    syncSeek(t);

    // If host is currently playing after seek, reaffirm PLAY for peers.
    const player = playerRef.current;
    if (player && !player.paused) {
      syncPlay(t);
    }

    setTimeout(() => (seekingRef.current = false), 300);
  }, [isHost, syncSeek, syncPlay]);

  if (!mediaUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-black/5 rounded-xl select-none">
        <div className="text-center">
          <p className="font-display text-3xl text-black/20">NO MEDIA</p>
          <p className="text-sm text-black/30 mt-1 font-serif italic">
            No video loaded for this room
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-black shadow-lg">
      <ReactPlayer
        ref={playerRef}
        src={mediaUrl}
        playing={isPlaying}
        controls
        width="100%"
        height="100%"
        style={{ aspectRatio: "16/9" }}
        onPlay={handlePlay}
        onPause={handlePause}
        onSeeking={handleSeeking}
        onSeeked={handleSeeked}
      />
    </div>
  );
}
