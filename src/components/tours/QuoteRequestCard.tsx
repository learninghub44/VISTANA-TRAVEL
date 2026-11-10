"use client";

import { useState } from "react";
import { MessageSquareQuote, CheckCircle2 } from "lucide-react";
import { requestQuoteAction } from "@/app/actions";

/** "Not ready to book?" — captures a lead without requiring an account. */
export default function QuoteRequestCard({ tourSlug, tourTitle }: { tourSlug: string; tourTitle: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  const [f, setF] = useState({ name: "", email: "", phone: "", start_date: "", adults: 2, children: 0, message: "", website: "" });
  const field = "w-full rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-navy-500 text-slate-800 dark:text-slate-100";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy"); setError("");
    const r = await requestQuoteAction({
      name: f.name, email: f.email, phone: f.phone || undefined, tour_slug: tourSlug,
      start_date: f.start_date || undefined, adults: f.adults, children: f.children, message: f.message || undefined, website: f.website,
    });
    if (r.success) return setState("done");
    setError(r.error || "Could not send your request.");
    setState("idle");
  }

  return (
    <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      {state === "done" ? (
        <p className="flex items-start gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 className="h-5 w-5 shrink-0" /> Thank you! We&apos;ll send your free quote for {tourTitle} shortly.</p>
      ) : !open ? (
        <button onClick={() => setOpen(true)} className="w-full flex items-center gap-3 text-left">
          <span className="h-10 w-10 rounded-full bg-gold/15 text-gold-700 flex items-center justify-center shrink-0"><MessageSquareQuote className="h-5 w-5" /></span>
          <span>
            <span className="block text-sm font-bold text-slate-900 dark:text-white">Not ready to book?</span>
            <span className="block text-xs text-slate-500 dark:text-slate-300">Get a free personalised quote — no account needed.</span>
          </span>
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-2.5">
          <p className="text-sm font-bold text-slate-900 dark:text-white">Free quote for this tour</p>
          <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Your name" maxLength={120} className={field} />
          <input required type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email" maxLength={254} className={field} />
          <input type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="Phone / WhatsApp (optional)" maxLength={24} className={field} />
          <div className="grid grid-cols-3 gap-2">
            <input type="date" value={f.start_date} onChange={(e) => setF({ ...f, start_date: e.target.value })} className={`${field} col-span-3 sm:col-span-1`} aria-label="Preferred start date" />
            <input type="number" min={1} max={50} value={f.adults} onChange={(e) => setF({ ...f, adults: Math.max(1, Number(e.target.value) || 1) })} className={field} aria-label="Adults" title="Adults" />
            <input type="number" min={0} max={50} value={f.children} onChange={(e) => setF({ ...f, children: Math.max(0, Number(e.target.value) || 0) })} className={field} aria-label="Children" title="Children" />
          </div>
          <p className="text-[10px] text-slate-400 -mt-1">Start date (optional) · adults · children</p>
          <textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Anything we should know? (optional)" rows={2} maxLength={1500} className={field} />
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></div>
          <button type="submit" disabled={state === "busy"} className="w-full bg-navy-600 hover:bg-navy-700 text-white font-bold text-sm rounded-full py-2.5 disabled:opacity-60 transition-colors">{state === "busy" ? "Sending…" : "Send me a quote"}</button>
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
