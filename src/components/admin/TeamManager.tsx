"use client";

import { useState } from "react";
import { ShieldCheck, UserPlus, UserMinus } from "lucide-react";
import { setAdminRoleAction } from "@/app/actions";

interface Admin { id: string; name: string; email: string; created_at: string }

export default function TeamManager({ admins, currentUserId }: { admins: Admin[]; currentUserId: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function change(target: string, makeAdmin: boolean) {
    if (!makeAdmin && !confirm(`Remove admin access for ${target}? They'll be signed out of the admin area.`)) return;
    setBusy(true);
    setMessage(null);
    const r = await setAdminRoleAction(target, makeAdmin);
    setBusy(false);
    setMessage(r.success ? { ok: true, text: makeAdmin ? `${target} is now an admin. They need to sign in again to see the admin area.` : `${target} is no longer an admin.` } : { ok: false, text: r.error || "Something went wrong." });
    if (r.success && makeAdmin) setEmail("");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={(e) => { e.preventDefault(); change(email, true); }} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><UserPlus className="h-4 w-4 text-gold-700" /> Add an admin</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email of an existing, verified account" className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-1 focus:ring-gold-500" />
          <button type="submit" disabled={busy} className="bg-slate-900 text-white text-xs font-bold rounded-xl px-5 py-2.5 disabled:opacity-50">{busy ? "Working…" : "Make admin"}</button>
        </div>
        <p className="text-[11px] text-slate-400">They should create a customer account and verify their email first. Every change is recorded in the audit log.</p>
        {message && <p role="status" className={`text-xs ${message.ok ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>}
      </form>

      <ul className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
        {admins.map((a) => (
          <li key={a.id} className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2 truncate"><ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" /> {a.name}{a.id === currentUserId && <span className="text-[10px] font-bold bg-gold/15 text-gold-700 rounded-full px-2 py-0.5">You</span>}</p>
              <p className="text-[11px] text-slate-500 truncate">{a.email} · admin since {new Date(a.created_at).toLocaleDateString()}</p>
            </div>
            {a.id !== currentUserId && (
              <button disabled={busy} onClick={() => change(a.email, false)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-100 rounded-lg py-1.5 px-3 disabled:opacity-50"><UserMinus className="h-3.5 w-3.5" /> Remove</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
