"use client";

import { use, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Send, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { HttpMethod } from "@/types";

interface ChatMsg {
  id: string;
  message: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string; image: string | null };
  endpoint: { id: string; method: string; path: string } | null;
}

interface EndpointOption {
  id: string;
  method: string;
  path: string;
}

export function ProjectChat({ projectId, endpoints }: { projectId: string; endpoints: EndpointOption[] }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [taggedEndpoint, setTaggedEndpoint] = useState<string | null>(null);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTimestamp = useRef<string | null>(null);

  const fetchMessages = async (isInitial = false) => {
    try {
      const url = isInitial
        ? `/api/projects/${projectId}/chat`
        : `/api/projects/${projectId}/chat?after=${encodeURIComponent(lastTimestamp.current || "")}`;
      const res = await fetch(url);
      if (res.ok) {
        const data: ChatMsg[] = await res.json();
        if (isInitial) {
          setMessages(data);
        } else if (data.length > 0) {
          setMessages(prev => [...prev, ...data]);
        }
        if (data.length > 0) {
          lastTimestamp.current = data[data.length - 1].createdAt;
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMessages(true);
    const interval = setInterval(() => fetchMessages(false), 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, endpointId: taggedEndpoint }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        lastTimestamp.current = msg.createdAt;
        setInput("");
        setTaggedEndpoint(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const selectedEndpoint = endpoints.find(ep => ep.id === taggedEndpoint);

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-[#9C9789]">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.user.id === session?.user?.id;
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                isMe ? "bg-[#F59E0B] text-black" : "bg-[#1A1A1A] text-white"
              }`}>
                {msg.user.name?.[0]?.toUpperCase() || msg.user.email[0].toUpperCase()}
              </div>
              {/* Bubble */}
              <div className={`max-w-[70%] ${isMe ? "text-right" : ""}`}>
                <div className="mb-0.5 flex items-center gap-2">
                  <span className={`font-[family-name:var(--font-mono)] text-[10px] font-medium text-[#9C9789] ${isMe ? "ml-auto" : ""}`}>
                    {msg.user.name || msg.user.email.split("@")[0]}
                  </span>
                </div>
                <div className={`rounded-lg px-3 py-2 text-sm ${
                  isMe
                    ? "bg-[#1A1A1A] text-white"
                    : "bg-[#F0EDE6] text-[#1A1A1A]"
                }`}>
                  {msg.message}
                  {msg.endpoint && (
                    <div className={`mt-1.5 flex items-center gap-1.5 rounded px-2 py-1 text-[10px] ${
                      isMe ? "bg-[#333]" : "bg-white border border-[#E5E1D8]"
                    }`}>
                      <Badge method={msg.endpoint.method as HttpMethod} size="sm" />
                      <span className="font-[family-name:var(--font-mono)]">{msg.endpoint.path}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Tagged endpoint indicator */}
      {selectedEndpoint && (
        <div className="flex items-center gap-2 border-t border-[#E5E1D8] bg-[#FFFBEB] px-4 py-2">
          <Tag className="h-3 w-3 text-[#F59E0B]" />
          <span className="text-xs text-[#9C9789]">Tagged:</span>
          <Badge method={selectedEndpoint.method as HttpMethod} size="sm" />
          <span className="font-[family-name:var(--font-mono)] text-xs">{selectedEndpoint.path}</span>
          <button onClick={() => setTaggedEndpoint(null)} className="ml-auto text-[#9C9789] hover:text-red-500">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Tag picker */}
      {showTagPicker && (
        <div className="border-t border-[#E5E1D8] bg-white p-2 max-h-32 overflow-y-auto">
          <p className="px-2 pb-1 text-[10px] font-medium text-[#9C9789]">TAG AN ENDPOINT</p>
          {endpoints.map(ep => (
            <button
              key={ep.id}
              onClick={() => { setTaggedEndpoint(ep.id); setShowTagPicker(false); }}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-[#F0EDE6]"
            >
              <Badge method={ep.method as HttpMethod} size="sm" />
              <span className="font-[family-name:var(--font-mono)] text-xs">{ep.path}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-[#E5E1D8] bg-white p-3">
        <button
          type="button"
          onClick={() => setShowTagPicker(!showTagPicker)}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors ${
            showTagPicker ? "bg-[#F59E0B] text-black" : "text-[#9C9789] hover:bg-[#F0EDE6]"
          }`}
          title="Tag an endpoint"
        >
          <Tag className="h-4 w-4" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-[#E5E1D8] bg-[#F9F8F6] px-3 py-2 text-sm outline-none transition-colors focus:border-[#F59E0B] placeholder:text-[#C4C0B6]"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#1A1A1A] text-white transition-colors hover:bg-[#333] disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
