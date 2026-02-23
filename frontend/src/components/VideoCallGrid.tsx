import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from "lucide-react";
import { useWebRTC, type PeerStream } from "../hooks/useWebRTC";
import { useRoomStore } from "../store/useRoomStore";

/* -----------------------------------------------------------------
 *  Small video tile
 * --------------------------------------------------------------- */
function VideoTile({
  stream,
  label,
  highlight = false,
}: {
  stream: MediaStream;
  label: string;
  highlight?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.srcObject = stream;
    ref.current.muted = label === "You";
    ref.current.play().catch(() => {});
  }, [stream, label]);

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-black ${
        highlight ? "ring-2 ring-kormek-primary" : ""
      }`}
    >
      <video
        ref={ref}
        autoPlay
        playsInline
        muted={label === "You"}
        className="w-full h-full object-cover"
      />
      <span className="absolute bottom-1 left-2 text-[11px] text-white/80 bg-black/50 rounded px-1.5 py-0.5">
        {label}
      </span>
    </div>
  );
}

/* -----------------------------------------------------------------
 *  Grid + controls
 * --------------------------------------------------------------- */
export default function VideoCallGrid() {
  const isHost = useRoomStore((s) => s.isHost);
  const meetingStarted = useRoomStore((s) => s.meetingStarted);
  const startMeeting = useRoomStore((s) => s.startMeeting);

  const {
    localStream,
    remoteStreams,
    callActive,
    audioEnabled,
    videoEnabled,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useWebRTC();

  const handlePrimaryStart = async () => {
    if (isHost) {
      startMeeting();
    }
    await startCall();
  };

  const handleEnd = () => {
    endCall();
  };

  if (!meetingStarted) {
    if (!isHost) {
      return (
        <div className="flex items-center justify-center h-full p-4 text-xs text-kormek-text/55">
          Waiting for host to start meeting…
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full p-4">
        <button
          onClick={handlePrimaryStart}
          className="flex items-center gap-2 rounded-lg bg-kormek-primary hover:bg-kormek-secondary text-white text-sm font-medium px-4 py-2 transition-colors cursor-pointer"
        >
          <Phone className="h-4 w-4" />
          Start Meeting
        </button>
      </div>
    );
  }

  if (!callActive) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <button
          onClick={handlePrimaryStart}
          className="flex items-center gap-2 rounded-lg bg-kormek-primary hover:bg-kormek-secondary text-white text-sm font-medium px-4 py-2 transition-colors cursor-pointer"
        >
          <Phone className="h-4 w-4" />
          Join Meeting
        </button>
      </div>
    );
  }

  // Build tile list: local first, then remotes
  const tiles: { label: string; stream: MediaStream; highlight: boolean }[] =
    [];
  if (localStream) {
    tiles.push({ label: "You", stream: localStream, highlight: false });
  }
  remoteStreams.forEach((ps: PeerStream) => {
    tiles.push({ label: ps.username, stream: ps.stream, highlight: true });
  });

  // Responsive grid columns
  const cols =
    tiles.length <= 1
      ? "grid-cols-1"
      : tiles.length <= 4
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <div className="flex flex-col h-full">
      {/* Video grid */}
      <div
        className={`flex-1 min-h-0 overflow-auto grid ${cols} gap-2 p-2 auto-rows-fr`}
      >
        {tiles.map((t, index) => (
          <VideoTile key={`${t.label}-${index}`} {...t} />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 py-3 border-t border-kormek-bg/40">
        <button
          onClick={toggleAudio}
          className={`rounded-full p-2.5 transition-colors cursor-pointer ${
            audioEnabled
              ? "bg-kormek-surface hover:bg-kormek-secondary"
              : "bg-red-500/80 hover:bg-red-600"
          }`}
          title={audioEnabled ? "Mute mic" : "Unmute mic"}
        >
          {audioEnabled ? (
            <Mic className="h-4 w-4 text-white" />
          ) : (
            <MicOff className="h-4 w-4 text-white" />
          )}
        </button>

        <button
          onClick={toggleVideo}
          className={`rounded-full p-2.5 transition-colors cursor-pointer ${
            videoEnabled
              ? "bg-kormek-surface hover:bg-kormek-secondary"
              : "bg-red-500/80 hover:bg-red-600"
          }`}
          title={videoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {videoEnabled ? (
            <Video className="h-4 w-4 text-white" />
          ) : (
            <VideoOff className="h-4 w-4 text-white" />
          )}
        </button>

        <button
          onClick={handleEnd}
          className="rounded-full bg-red-500 hover:bg-red-600 p-2.5 transition-colors cursor-pointer"
          title="End call"
        >
          <PhoneOff className="h-4 w-4 text-white" />
        </button>
      </div>
    </div>
  );
}
