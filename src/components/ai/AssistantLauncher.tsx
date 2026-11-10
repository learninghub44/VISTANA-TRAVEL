"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sparkles, X, Maximize2, Compass } from "lucide-react";
import AssistantChat from "@/components/ai/AssistantChat";

const SEEN_KEY = "vistana-assistant-nudged";

/**
 * Prominent launcher: a labelled button with a one-time friendly pop-up bubble,
 * opening a large centred window on desktop (full screen on phones) with a link
 * to the full-page planner. Hidden in admin and on the planner page itself.
 */
export default function AssistantLauncher({ whatsappHref }: { whatsappHref: string | null }) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);

  const hidden = pathname.startsWith("/admin") || pathname.startsWith("/assistant");

  useEffect(() => {
    if (hidden) return;
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === "1"; } catch {}
    if (seen) return;
    const t = setTimeout(() => setNudge(true), 6000);
    return () => clearTimeout(t);
  }, [hidden]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open]);

  if (hidden) return null;

  const dismissNudge = () => {
    setNudge(false);
    try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {}
  };
  const openChat = () => { dismissNudge(); setOpen(true); };

  return (
    <>
      {!open && (
        <div className="fixed right-4 sm:right-6 z-50 flex flex-col items-end gap-3" style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}>
          {nudge && (
            <div role="status" className="relative max-w-[260px] rounded-2xl rounded-br-sm bg-white dark:bg-slate-800 shadow-2xl border border-slate-100 dark:border-slate-700 p-4 motion-safe:animate-[fadeUp_.4s_ease-out]">
              <button onClick={dismissNudge} aria-label="Dismiss" className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>
              <p className="font-serif font-bold text-sm text-slate-900 dark:text-white pr-4">Need help planning? 🌍</p>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 leading-relaxed">I can plan your trip, book a tour, or set up a call with our team.</p>
              <button onClick={openChat} className="mt-3 w-full bg-navy-600 hover:bg-navy-700 text-white text-xs font-bold rounded-full py-2 transition-colors">Start planning</button>
            </div>
          )}
          <button
            onClick={openChat}
            aria-label="Open the AI trip planner"
            className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-navy-700 to-navy-600 text-white pl-4 pr-5 py-3.5 shadow-xl shadow-navy-900/30 hover:shadow-2xl hover:scale-105 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60"
          >
            <span className="relative flex h-6 w-6 items-center justify-center">
              <Sparkles className="h-5 w-5 text-gold" />
              <span className="absolute inset-0 rounded-full bg-gold/30 motion-safe:animate-ping" aria-hidden="true" />
            </span>
            <span className="text-sm font-bold whitespace-nowrap"><span className="hidden sm:inline">Plan my trip with </span>AI</span>
          </button>
        </div>
      )}

      {open && (
        <div role="dialog" aria-modal="true" aria-label="AI trip planner" className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-6 bg-slate-950/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full h-full sm:h-[min(760px,88vh)] sm:max-w-4xl bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 bg-gradient-to-r from-slate-900 to-navy-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center"><Compass className="h-5 w-5 text-gold" /></span>
                <div>
                  <p className="font-serif font-bold leading-tight">Vistana Trip Planner</p>
                  <p className="text-[11px] text-slate-300 leading-tight">Plan · Book · Talk to our team</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link href="/assistant" onClick={() => setOpen(false)} className="hidden sm:flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-2 hover:bg-white/10 transition-colors"><Maximize2 className="h-3.5 w-3.5" /> Full page</Link>
                <button onClick={() => setOpen(false)} aria-label="Close planner" className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center"><X className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="flex-1 min-h-0"><AssistantChat variant="modal" whatsappHref={whatsappHref} /></div>
          </div>
        </div>
      )}
    </>
  );
}
