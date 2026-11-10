"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Loader2, CalendarCheck, Ticket, Users, Calendar, CheckCircle2, Sparkles, Phone } from "lucide-react";
import { createBookingAction, requestMeetingAction } from "@/app/actions";
import RichText from "@/components/ai/RichText";
import { MEETING_CHANNELS } from "@/lib/meetingSchema";
import type { AssistantProposal, BookingProposal, MeetingProposal } from "@/services/ai/proposals";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  proposals?: AssistantProposal[];
}

const GREETING: ChatMessage = {
  id: 0,
  role: "assistant",
  content:
    "Jambo! I'm your Vistana travel planner. I can **plan your whole trip**, find the right safari for your budget, **book a tour** for you to confirm, or **set up a call** with our safari designers. Where would you like to go?",
};

const SUGGESTIONS = [
  "Plan a 7-day safari for 2 adults in July",
  "What are your best beach holidays?",
  "I'd like a call with a safari designer",
  "Show me tours under $1,500",
];

const STORAGE_KEY = "vistana-assistant-chat-v1";

export default function AssistantChat({ variant = "page", whatsappHref }: { variant?: "page" | "modal"; whatsappHref?: string | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [restored, setRestored] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  // Keep the conversation across page changes and the sign-in detour, so a
  // proposed booking is still there when the customer comes back.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        if (Array.isArray(parsed) && parsed.length) {
          setMessages(parsed);
          nextId.current = Math.max(...parsed.map((m) => m.id)) + 1;
        }
      }
    } catch {}
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch {}
  }, [messages, restored]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, loading]);

  const send = useCallback(async (text: string) => {
    const clean = text.trim();
    if (!clean || loading) return;
    const userMsg: ChatMessage = { id: nextId.current++, role: "user", content: clean };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.filter((m) => m.id !== 0).slice(-20).map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: "assistant",
          content: data.reply ?? data.error ?? "Sorry, something went wrong. Please try WhatsApp instead.",
          proposals: data.proposals?.length ? data.proposals : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [...prev, { id: nextId.current++, role: "assistant", content: "I couldn't reach the assistant. Please check your connection or use WhatsApp." }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading]);

  const onlyGreeting = messages.length === 1;
  const big = variant === "page";

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${big ? "px-4 sm:px-8 py-6" : "px-4 py-4"} space-y-4 bg-slate-50 dark:bg-[#0b0f19]`}>
        <div className={big ? "max-w-3xl mx-auto space-y-4" : "space-y-4"}>
          {messages.map((m) => (
            <div key={m.id} className="space-y-3">
              <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`${big ? "max-w-[85%] text-sm" : "max-w-[88%] text-[13px]"} rounded-2xl px-4 py-3 leading-relaxed ${
                    m.role === "user"
                      ? "bg-navy-600 text-white rounded-br-sm whitespace-pre-wrap"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {m.role === "assistant" ? <RichText text={m.content} /> : m.content}
                </div>
              </div>
              {m.proposals?.map((p, i) =>
                p.type === "booking" ? <BookingCard key={i} p={p} /> : <MeetingCard key={i} p={p} />
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-navy-500" />
                <span className="text-xs text-slate-400">Planning&hellip;</span>
              </div>
            </div>
          )}

          {onlyGreeting && (
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border border-navy-200 dark:border-navy-800 bg-white dark:bg-slate-900 text-navy-700 dark:text-navy-300 px-3.5 py-2 hover:bg-navy-50 dark:hover:bg-navy-950 transition-colors">
                  <Sparkles className="h-3 w-3 text-gold" /> {s}
                </button>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className={`flex items-center gap-2 ${big ? "max-w-3xl mx-auto" : ""}`}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me about your dream trip…"
            maxLength={2000}
            className="flex-1 px-5 py-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-navy-500"
          />
          <button type="submit" disabled={loading || !input.trim()} aria-label="Send message" className="bg-navy-600 hover:bg-navy-700 disabled:opacity-40 text-white p-3 rounded-full transition-colors">
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className={`text-[10px] text-slate-400 mt-2 text-center ${big ? "max-w-3xl mx-auto" : ""}`}>
          AI can make mistakes — check prices and dates before confirming. Never share passport or card details here.
          {whatsappHref && (<> Prefer a person? <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="underline font-semibold">WhatsApp us</a>.</>)}
        </p>
      </div>
    </div>
  );
}

function BookingCard({ p }: { p: BookingProposal }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "login">("idle");
  const [error, setError] = useState("");

  async function confirm() {
    setState("busy");
    setError("");
    const res = await createBookingAction({ tourId: p.tourId, startDate: p.startDate, endDate: p.endDate, adults: p.adults, children: p.children });
    if (res.success) return setState("done");
    if (/log in/i.test(res.error || "")) return setState("login");
    setError(res.error || "Could not create the booking.");
    setState("idle");
  }

  return (
    <div className="ml-0 sm:ml-2 rounded-2xl border-2 border-gold/50 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-gold-700 text-[11px] font-bold uppercase tracking-wider"><Ticket className="h-4 w-4" /> Booking ready to confirm</div>
      <p className="font-serif font-bold text-base text-slate-900 dark:text-white">{p.tourTitle}</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 dark:text-slate-300">
        <dt className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Dates</dt><dd className="font-semibold">{p.startDate} → {p.endDate}</dd>
        <dt className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Guests</dt><dd className="font-semibold">{p.adults} adult{p.adults > 1 ? "s" : ""}{p.children ? `, ${p.children} child${p.children > 1 ? "ren" : ""}` : ""}</dd>
        <dt>Estimated total</dt><dd className="font-bold text-slate-900 dark:text-white">${p.estimatedTotalUsd.toLocaleString()}</dd>
      </dl>
      <p className="text-[10px] text-slate-400">No payment is taken now. Our team reviews the request and confirms availability.</p>

      {state === "done" ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 className="h-5 w-5" /> Request sent! <Link href="/portal" className="underline">View in your account</Link></p>
      ) : state === "login" ? (
        <div className="text-xs space-y-2">
          <p className="text-slate-600 dark:text-slate-300">Please sign in to confirm — your chat and this booking will still be here when you come back.</p>
          <div className="flex gap-2">
            <Link href="/portal/login" className="bg-navy-600 text-white font-semibold rounded-full px-4 py-2">Sign in</Link>
            <Link href="/portal/register" className="border border-navy-300 text-navy-700 dark:text-navy-300 font-semibold rounded-full px-4 py-2">Create account</Link>
          </div>
        </div>
      ) : (
        <button onClick={confirm} disabled={state === "busy"} className="w-full sm:w-auto bg-gold hover:bg-gold-600 text-navy-950 font-bold text-sm rounded-full px-6 py-2.5 disabled:opacity-60 transition-colors">
          {state === "busy" ? "Sending…" : "Confirm booking request"}
        </button>
      )}
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function MeetingCard({ p }: { p: MeetingProposal }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", channel: p.channel, date: p.preferredDate, time: p.preferredTime, website: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError("");
    const res = await requestMeetingAction({
      name: form.name, email: form.email, phone: form.phone || undefined, topic: p.topic, channel: form.channel,
      preferred_date: form.date, preferred_time: form.time, tour_slug: p.tourSlug, website: form.website,
    });
    if (res.success) return setState("done");
    setError(res.error || "Could not send your request.");
    setState("idle");
  }

  const field = "w-full rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-navy-500";

  return (
    <div className="ml-0 sm:ml-2 rounded-2xl border-2 border-navy-300 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-navy-700 dark:text-navy-300 text-[11px] font-bold uppercase tracking-wider"><CalendarCheck className="h-4 w-4" /> Meeting request</div>
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.topic}</p>
      {state === "done" ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 className="h-5 w-5" /> Request sent — we&apos;ll email you to confirm the time.</p>
      ) : (
        <form onSubmit={confirm} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <input required type="date" value={form.date} onChange={set("date")} className={field} aria-label="Date" />
            <input required type="time" min="08:00" max="18:00" value={form.time} onChange={set("time")} className={field} aria-label="Time (East Africa Time)" />
          </div>
          <select value={form.channel} onChange={set("channel")} className={field} aria-label="Meeting format">
            {MEETING_CHANNELS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input required value={form.name} onChange={set("name")} placeholder="Your name" maxLength={120} className={field} />
            <input required type="email" value={form.email} onChange={set("email")} placeholder="Email" maxLength={254} className={field} />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input type="tel" value={form.phone} onChange={set("phone")} placeholder="Phone / WhatsApp (optional)" maxLength={24} className={`${field} pl-8`} />
          </div>
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} /></div>
          <p className="text-[10px] text-slate-400">Times are East Africa Time (UTC+3), 08:00–18:00. This is a request — we&apos;ll confirm by email.</p>
          <button type="submit" disabled={state === "busy"} className="bg-navy-600 hover:bg-navy-700 text-white font-bold text-sm rounded-full px-6 py-2.5 disabled:opacity-60 transition-colors">
            {state === "busy" ? "Sending…" : "Confirm meeting request"}
          </button>
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
