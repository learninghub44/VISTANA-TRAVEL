"use client";

import { useState } from "react";
import { Plane, UserCog, KeyRound, CheckCircle2 } from "lucide-react";
import { updateProfileAction, changePasswordAction } from "@/app/actions";

export interface NextTrip { title: string; startDate: string; daysAway: number }

export default function AccountPanel({ name, phone, nextTrip }: { name: string; phone?: string; nextTrip: NextTrip | null }) {
  const [open, setOpen] = useState<null | "profile" | "password">(null);
  const [p, setP] = useState({ name, phone: phone ?? "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [state, setState] = useState<{ busy: boolean; ok?: string; error?: string }>({ busy: false });
  const field = "w-full rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-navy-500 text-slate-800 dark:text-slate-100";

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setState({ busy: true });
    const r = await updateProfileAction({ name: p.name, phone: p.phone || undefined });
    setState(r.success ? { busy: false, ok: "Details saved." } : { busy: false, error: r.error });
  }
  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next !== pw.confirm) return setState({ busy: false, error: "The new passwords don't match." });
    setState({ busy: true });
    const r = await changePasswordAction({ current: pw.current, next: pw.next });
    if (r.success) setPw({ current: "", next: "", confirm: "" });
    setState(r.success ? { busy: false, ok: "Password changed. Other devices have been signed out." } : { busy: false, error: r.error });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      {/* Next trip */}
      <div className="rounded-3xl bg-gradient-to-br from-navy-700 to-slate-900 text-white p-6 flex flex-col justify-between min-h-[170px]">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gold"><Plane className="h-4 w-4" /> Your next trip</div>
        {nextTrip ? (
          <div>
            <p className="font-serif text-xl font-bold leading-snug">{nextTrip.title}</p>
            <p className="text-sm text-slate-300 mt-1">
              {nextTrip.daysAway === 0 ? "Starts today!" : nextTrip.daysAway === 1 ? "Starts tomorrow" : `Starts in ${nextTrip.daysAway} days`} · {nextTrip.startDate}
            </p>
          </div>
        ) : (
          <div>
            <p className="font-serif text-xl font-bold">No upcoming trips yet</p>
            <a href="/assistant" className="inline-block mt-2 text-sm font-semibold text-gold underline underline-offset-2">Plan one with our AI planner →</a>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5">
        <div className="flex flex-wrap gap-2 mb-1">
          <button onClick={() => { setOpen(open === "profile" ? null : "profile"); setState({ busy: false }); }} className={`inline-flex items-center gap-2 text-xs font-bold rounded-full px-4 py-2 border ${open === "profile" ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-700 dark:text-slate-200"}`}><UserCog className="h-4 w-4" /> Edit my details</button>
          <button onClick={() => { setOpen(open === "password" ? null : "password"); setState({ busy: false }); }} className={`inline-flex items-center gap-2 text-xs font-bold rounded-full px-4 py-2 border ${open === "password" ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-700 dark:text-slate-200"}`}><KeyRound className="h-4 w-4" /> Change password</button>
        </div>

        {open === "profile" && (
          <form onSubmit={saveProfile} className="space-y-3 mt-4">
            <input required value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} placeholder="Full name" maxLength={120} className={field} aria-label="Full name" />
            <input type="tel" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} placeholder="Phone / WhatsApp" maxLength={24} className={field} aria-label="Phone" />
            <button disabled={state.busy} className="bg-navy-600 hover:bg-navy-700 text-white text-sm font-bold rounded-full px-6 py-2.5 disabled:opacity-60">{state.busy ? "Saving…" : "Save details"}</button>
          </form>
        )}
        {open === "password" && (
          <form onSubmit={savePassword} className="space-y-3 mt-4">
            <input required type="password" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} placeholder="Current password" className={field} aria-label="Current password" />
            <input required type="password" autoComplete="new-password" minLength={8} maxLength={128} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} placeholder="New password (8+ characters)" className={field} aria-label="New password" />
            <input required type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} placeholder="Repeat new password" className={field} aria-label="Repeat new password" />
            <button disabled={state.busy} className="bg-navy-600 hover:bg-navy-700 text-white text-sm font-bold rounded-full px-6 py-2.5 disabled:opacity-60">{state.busy ? "Updating…" : "Change password"}</button>
          </form>
        )}
        {state.ok && <p role="status" className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> {state.ok}</p>}
        {state.error && <p role="alert" className="mt-3 text-sm text-red-600">{state.error}</p>}
        {!open && !state.ok && <p className="text-xs text-slate-400 mt-3">Keep your contact details current so our team can reach you about your trip.</p>}
      </div>
    </div>
  );
}
