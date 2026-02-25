import { useState } from "react";
import { Check, Copy, X } from "lucide-react";

interface ShareModalProps {
  roomId: string;
  onClose: () => void;
}

export default function ShareModal({ roomId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/room/${roomId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-eggshell rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black/30 hover:text-black transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="font-display text-4xl text-black tracking-tight mb-2">
          INVITE FRIENDS
        </h2>
        <p className="text-sm text-black/50 font-serif italic mb-6">
          Share this link so others can join your room
        </p>

        {/* Link display + copy */}
        <div className="flex items-center gap-2 bg-ivory rounded-lg p-3 border border-black/10">
          <input
            readOnly
            value={inviteUrl}
            className="flex-1 bg-transparent text-sm text-black outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer
              bg-green text-white hover:bg-green/90"
          >
            {copied ? (
              <>
                <Check size={14} />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Room code */}
        <p className="text-xs text-black/40 mt-4 text-center">
          Room code:{" "}
          <span className="font-mono font-semibold text-black/60">
            {roomId}
          </span>
        </p>
      </div>
    </div>
  );
}
