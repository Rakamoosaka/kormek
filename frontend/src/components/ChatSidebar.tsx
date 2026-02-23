import { FormEvent, useEffect, useRef, useState } from "react";
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
      <div className="px-4 py-3 border-b border-kormek-bg/40">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-kormek-text/60">
          Chat
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-kormek-text/30 text-xs mt-8 select-none">
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
              <span className="text-[11px] text-kormek-text/40 mb-0.5">
                {isSelf ? "You" : msg.sender}
              </span>
              <div
                className={`max-w-[85%] rounded-lg px-3 py-1.5 text-sm break-words ${
                  isSelf
                    ? "bg-kormek-primary/20 text-kormek-text"
                    : "bg-kormek-bg text-kormek-text"
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
        className="px-3 py-3 border-t border-kormek-bg/40 flex gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-lg bg-kormek-bg px-3 py-2 text-sm text-kormek-text placeholder:text-kormek-text/40 outline-none focus:ring-2 focus:ring-kormek-primary/50"
        />
        <button
          type="submit"
          className="rounded-lg bg-kormek-primary hover:bg-kormek-secondary p-2 transition-colors cursor-pointer"
        >
          <Send className="h-4 w-4 text-white" />
        </button>
      </form>
    </div>
  );
}
