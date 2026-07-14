"use client";

import { useEffect, useRef, useState } from "react";
import { Compass, MessageCircle, Send, X, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Jambo! I'm the Vistana travel assistant. Ask me about safaris, destinations, prices, or itineraries \u2014 or tap WhatsApp below to talk to a real safari designer.",
};

export default function AssistantWidget({ whatsappHref }: { whatsappHref: string | null }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.filter((m) => m !== GREETING) }),
      });
      const data = await res.json();
      const replyText: string =
        data.reply ?? data.error ?? "Sorry, something went wrong. Please try WhatsApp instead.";
      setMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I couldn't reach the assistant service. Please try WhatsApp instead." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 dark:bg-[#070a12] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-navy-400" />
              <div>
                <p className="font-serif font-bold text-sm leading-tight">Vistana AI Assistant</p>
                <p className="text-[10px] text-slate-400 leading-tight">Ask about tours & destinations</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="p-1.5 rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 space-y-3 bg-slate-50 dark:bg-[#0b0f19]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-navy-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-navy-500" />
                  <span className="text-[11px] text-slate-400">Thinking&hellip;</span>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp handoff CTA */}
          {whatsappHref && (
            <div className="px-4 pt-2 shrink-0">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-navy-50 dark:bg-navy-950/30 text-navy-700 dark:text-navy-400 text-[11px] font-semibold py-2 rounded-full border border-navy-200 dark:border-navy-900 hover:bg-navy-100 dark:hover:bg-navy-950/50 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Prefer a human? Chat on WhatsApp
              </a>
            </div>
          )}

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 flex items-center gap-2 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a safari, price, or destination..."
              className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs border-none outline-none focus:ring-1 focus:ring-navy-500"
              maxLength={2000}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="bg-navy-600 hover:bg-navy-700 disabled:opacity-40 text-white p-2.5 rounded-full transition-colors shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Launcher button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close travel assistant" : "Open travel assistant"}
        className="bg-navy-600 hover:bg-navy-700 text-white p-4 rounded-full shadow-xl transition-all hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <Compass className="h-6 w-6" />}
      </button>
    </div>
  );
}
