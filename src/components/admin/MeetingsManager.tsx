"use client";

import { useState } from "react";
import { Mail, Phone, Trash2, CalendarCheck, CheckCheck, XCircle } from "lucide-react";
import { updateMeetingStatusAction, deleteMeetingAction } from "@/app/actions";
import type { Meeting } from "@/services/db/types";

const styles: Record<Meeting["status"], string> = {
  Requested: "text-amber-700 bg-amber-500/10",
  Confirmed: "text-emerald-700 bg-emerald-500/10",
  Completed: "text-slate-600 bg-slate-500/10",
  Cancelled: "text-red-700 bg-red-500/10",
};

export default function MeetingsManager({ meetings }: { meetings: Meeting[] }) {
  const [filter, setFilter] = useState<"All" | Meeting["status"]>("Requested");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const list = meetings
    .filter((m) => filter === "All" || m.status === filter)
    .sort((a, b) => `${a.preferred_date} ${a.preferred_time}`.localeCompare(`${b.preferred_date} ${b.preferred_time}`));

  const setStatus = async (id: string, status: Meeting["status"]) => {
    setBusy(id); setError("");
    const r = await updateMeetingStatusAction(id, status);
    setBusy(null);
    if (!r.success) setError(r.error || "Update failed.");
  };
  const remove = async (id: string) => {
    if (!confirm("Permanently delete this meeting request?")) return;
    setBusy(id);
    const r = await deleteMeetingAction(id);
    setBusy(null);
    if (!r.success) setError(r.error || "Delete failed.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["Requested", "Confirmed", "Completed", "Cancelled", "All"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs font-semibold rounded-full px-3.5 py-1.5 border ${filter === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}>
            {s} {s !== "All" && <span className="opacity-60">({meetings.filter((m) => m.status === s).length})</span>}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}

      {list.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-xs text-slate-400">No meeting requests here yet.</div>
      ) : (
        <ul className="space-y-3">
          {list.map((m) => (
            <li key={m.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-gold-700" /> {m.preferred_date} at {m.preferred_time} EAT · {m.channel}</p>
                  <p className="text-xs text-slate-700 mt-1">{m.topic}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{m.name} · {m.email}{m.phone ? <> · <Phone className="inline h-3 w-3" /> {m.phone}</> : null}{m.tour_slug ? <> · about /tours/{m.tour_slug}</> : null}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 ${styles[m.status]}`}>{m.status}</span>
              </div>
              {m.notes && <p className="text-xs text-slate-600 whitespace-pre-wrap">{m.notes}</p>}
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${encodeURIComponent(m.email).replace(/%40/g, "@")}?subject=${encodeURIComponent("Your meeting with Vistana Tours")}`} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg py-1.5 px-3"><Mail className="h-3.5 w-3.5" /> Email</a>
                {m.status === "Requested" && <button disabled={busy === m.id} onClick={() => setStatus(m.id, "Confirmed")} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-emerald-200 text-emerald-700 rounded-lg py-1.5 px-3 disabled:opacity-50"><CheckCheck className="h-3.5 w-3.5" /> Confirm</button>}
                {m.status === "Confirmed" && <button disabled={busy === m.id} onClick={() => setStatus(m.id, "Completed")} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 rounded-lg py-1.5 px-3 disabled:opacity-50"><CheckCheck className="h-3.5 w-3.5" /> Mark completed</button>}
                {(m.status === "Requested" || m.status === "Confirmed") && <button disabled={busy === m.id} onClick={() => setStatus(m.id, "Cancelled")} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 rounded-lg py-1.5 px-3 disabled:opacity-50"><XCircle className="h-3.5 w-3.5" /> Cancel</button>}
                <button disabled={busy === m.id} onClick={() => remove(m.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-100 rounded-lg py-1.5 px-3 disabled:opacity-50 ml-auto"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
