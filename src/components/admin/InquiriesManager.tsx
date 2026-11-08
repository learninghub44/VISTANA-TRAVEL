"use client";

import { useState } from "react";
import { Search, Trash2, Mail, CheckCheck, Archive, Phone } from "lucide-react";
import { updateInquiryStatusAction, deleteInquiryAction } from "@/app/actions";
import { Inquiry } from "@/services/db/types";

const statusStyles: Record<Inquiry["status"], string> = {
  New: "text-amber-700 bg-amber-500/10",
  Replied: "text-emerald-700 bg-emerald-500/10",
  Archived: "text-slate-600 bg-slate-500/10",
};

export default function InquiriesManager({ inquiries }: { inquiries: Inquiry[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | Inquiry["status"]>("All");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = inquiries.filter((q) => {
    const text = `${q.name} ${q.email} ${q.subject} ${q.message}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (filter === "All" || q.status === filter);
  });

  const setStatus = async (id: string, status: Inquiry["status"]) => {
    setBusy(id);
    setError("");
    const res = await updateInquiryStatusAction(id, status);
    setBusy(null);
    if (!res.success) setError(res.error || "Failed to update inquiry.");
  };

  const remove = async (id: string) => {
    if (!confirm("Permanently delete this inquiry?")) return;
    setBusy(id);
    const res = await deleteInquiryAction(id);
    setBusy(null);
    if (!res.success) setError(res.error || "Failed to delete inquiry.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, subject or message…"
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "All" | Inquiry["status"])}
          className="bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-xs outline-none"
        >
          {["All", "New", "Replied", "Archived"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <p role="alert" className="text-xs text-red-600">{error}</p>}

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-xs text-slate-400">
          {inquiries.length === 0 ? "No inquiries yet. New messages from the contact form will appear here." : "No inquiries match your filters."}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((q) => (
            <li key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">{q.subject}</p>
                  <p className="text-[11px] text-slate-500">
                    {q.name} · {q.email}
                    {q.phone ? <> · <Phone className="inline h-3 w-3" /> {q.phone}</> : null} ·{" "}
                    {new Date(q.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 ${statusStyles[q.status]}`}>
                  {q.status}
                </span>
              </div>

              {/* React escapes this text; whitespace-pre-wrap keeps the visitor's line breaks. */}
              <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{q.message}</p>

              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`mailto:${encodeURIComponent(q.email).replace(/%40/g, "@")}?subject=${encodeURIComponent("Re: " + q.subject)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg py-1.5 px-3"
                >
                  <Mail className="h-3.5 w-3.5" /> Reply
                </a>
                {q.status !== "Replied" && (
                  <button disabled={busy === q.id} onClick={() => setStatus(q.id, "Replied")} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 rounded-lg py-1.5 px-3 disabled:opacity-50">
                    <CheckCheck className="h-3.5 w-3.5" /> Mark replied
                  </button>
                )}
                {q.status !== "Archived" && (
                  <button disabled={busy === q.id} onClick={() => setStatus(q.id, "Archived")} className="inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 rounded-lg py-1.5 px-3 disabled:opacity-50">
                    <Archive className="h-3.5 w-3.5" /> Archive
                  </button>
                )}
                <button disabled={busy === q.id} onClick={() => remove(q.id)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-100 rounded-lg py-1.5 px-3 disabled:opacity-50 ml-auto">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
