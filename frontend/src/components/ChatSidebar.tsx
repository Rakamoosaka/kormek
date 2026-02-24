import { type FormEvent, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useRoomStore } from "../store/useRoomStore";

export default function ChatSidebar() {
  const messages = useRoomStore((s) => s.messages);
  const sendChat = useRoomStore((s) => s.sendChat);
  const username = useRoomStore((s) => s.username);

  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendChat(draft);
    setDraft("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3 border-b border-black/10">
        <h2 className="text-xs font-medium tracking-widest uppercase text-black/40">
          Chat
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-black/25 text-xs mt-8 select-none font-serif italic">
            No messages yet
          </p>
        )}
        {messages.map((msg, i) => {
          const isSelf = msg.sender === username;
          return (
            <div
              key={i}
              className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
            >
              <span className="text-[11px] text-black/35 mb-0.5 font-medium">
                {isSelf ? "You" : msg.sender}
              </span>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm wrap-break-word ${
                  isSelf
                    ? "bg-green/15 text-black"
                    : "bg-eggshell text-black"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-black/10 flex gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-lg bg-eggshell px-4 py-2.5 text-sm text-black placeholder:text-black/30 outline-none focus:ring-2 focus:ring-green/30 transition-shadow"
        />
        <button
          type="submit"
          className="rounded-lg bg-green hover:bg-green/80 p-2.5 transition-colors cursor-pointer"
        >
          <Send className="h-4 w-4 text-white" />
        </button>
      </form>
    </div>
  );
}
