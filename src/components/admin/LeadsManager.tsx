"use client";

import { useMemo, useState } from "react";
import { Search, Download, Mail, Phone, MessageCircle, Trash2 } from "lucide-react";
import { updateLeadAction, deleteLeadAction } from "@/app/actions";
import { downloadCsv } from "@/lib/csv";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { LEAD_STATUSES } from "@/lib/leadSchema";
import type { Lead } from "@/services/db/types";

const statusStyle: Record<Lead["status"], string> = {
  New: "bg-amber-500/10 text-amber-700",
  Contacted: "bg-sky-500/10 text-sky-700",
  Qualified: "bg-violet-500/10 text-violet-700",
  Won: "bg-emerald-500/10 text-emerald-700",
  Lost: "bg-slate-500/10 text-slate-500",
};
const sourceLabel: Record<Lead["source"], string> = {
  contact: "Contact form", newsletter: "Newsletter", meeting: "Meeting request", quote: "Quote request", assistant: "AI planner",
};

export default function LeadsManager({ leads }: { leads: Lead[] }) {
  const [filter, setFilter] = useState<"All" | Lead["status"]>("New");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [local, setLocal] = useState<Record<string, Partial<Lead>>>({});

  const rows = useMemo(() => leads.map((l) => ({ ...l, ...local[l.id] })), [leads, local]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { All: rows.length };
    LEAD_STATUSES.forEach((s) => (c[s] = rows.filter((l) => l.status === s).length));
    return c;
  }, [rows]);

  const shown = rows.filter((l) => {
    if (filter !== "All" && l.status !== filter) return false;
    const text = `${l.name ?? ""} ${l.email} ${l.phone ?? ""} ${l.interest ?? ""} ${l.message ?? ""}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  async function save(id: string, updates: { status?: Lead["status"]; notes?: string }) {
    setBusy(id); setError("");
    setLocal((p) => ({ ...p, [id]: { ...p[id], ...updates } })); // optimistic
    const r = await updateLeadAction(id, updates);
    setBusy(null);
    if (!r.success) {
      setError(r.error || "Update failed.");
      setLocal((p) => { const { [id]: _, ...rest } = p; return rest; });
    }
  }
  async function remove(id: string) {
    if (!confirm("Permanently delete this lead?")) return;
    setBusy(id);
    const r = await deleteLeadAction(id);
    setBusy(null);
    if (!r.success) setError(r.error || "Delete failed.");
  }

  const exportCsv = () =>
    downloadCsv("leads", ["Name", "Email", "Phone", "Source", "Interest", "Status", "Contacts", "Notes", "First seen", "Last activity"],
      shown.map((l) => [l.name ?? "", l.email, l.phone ?? "", sourceLabel[l.source], l.interest ?? "", l.status, l.touches, l.notes ?? "", l.created_at.slice(0, 10), l.updated_at.slice(0, 10)]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["All", ...LEAD_STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs font-semibold rounded-full px-3.5 py-1.5 border ${filter === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}>
            {s} <span className="opacity-60">({counts[s] ?? 0})</span>
          </button>
        ))}
        <button onClick={exportCsv} className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 bg-white rounded-full px-3.5 py-1.5">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, phone, tour or message…" className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-gold-500" />
      </div>
      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}

      {shown.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-xs text-slate-400">
          {leads.length === 0 ? "No leads yet — they appear here automatically when someone contacts you, subscribes or asks for a quote." : "No leads match this view."}
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((l) => {
            const wa = buildWhatsAppUrl(l.phone, `Hello${l.name ? " " + l.name.split(" ")[0] : ""}, this is Vistana Tours & Travel following up on your enquiry${l.interest ? ` about ${l.interest}` : ""}.`);
            return (
              <li key={l.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{l.name || l.email}</p>
                    <p className="text-[11px] text-slate-500 truncate">{l.name ? `${l.email} · ` : ""}{l.phone ?? ""}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      <span className="font-semibold">{sourceLabel[l.source]}</span>
                      {l.interest ? <> · {l.interest}</> : null}
                      {l.touches > 1 ? <> · <span className="text-gold-700 font-semibold">{l.touches} contacts</span></> : null}
                      {" · "}last activity {new Date(l.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <select
                    value={l.status}
                    disabled={busy === l.id}
                    onChange={(e) => save(l.id, { status: e.target.value as Lead["status"] })}
                    aria-label="Lead status"
                    className={`text-[11px] font-bold uppercase tracking-wider rounded-full px-3 py-1.5 border-0 outline-none cursor-pointer ${statusStyle[l.status]}`}
                  >
                    {LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {l.message && <p className="text-xs text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-3">{l.message}</p>}

                <textarea
                  defaultValue={l.notes ?? ""}
                  onBlur={(e) => { if ((e.target.value || "") !== (l.notes || "")) save(l.id, { notes: e.target.value }); }}
                  placeholder="Private notes (saved when you click away)…"
                  rows={2}
                  maxLength={3000}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-1 focus:ring-gold-500"
                />

                <div className="flex flex-wrap gap-2">
                  <a href={`mailto:${encodeURIComponent(l.email).replace(/%40/g, "@")}`} onClick={() => l.status === "New" && save(l.id, { status: "Contacted" })} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg py-1.5 px-3"><Mail className="h-3.5 w-3.5" /> Email</a>
                  {wa && <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => l.status === "New" && save(l.id, { status: "Contacted" })} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#25D366] text-white rounded-lg py-1.5 px-3"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>}
                  {l.phone && <a href={`tel:${l.phone.replace(/[^0-9+]/g, "")}`} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 rounded-lg py-1.5 px-3"><Phone className="h-3.5 w-3.5" /> Call</a>}
                  <button disabled={busy === l.id} onClick={() => remove(l.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-100 rounded-lg py-1.5 px-3 disabled:opacity-50 ml-auto"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
