"use client";

import { useState } from "react";
import { updateReviewStatusAction, deleteReviewAction } from "@/app/actions";
import { Search, Trash2, Check, X, Info, Star, Download } from "lucide-react";
import { Review, Tour } from "@/services/db/types";
import { downloadCsv } from "@/lib/csv";

interface ReviewsManagerProps {
  reviews: Review[];
  tours: Tour[];
}

const statusStyles: Record<Review["status"], string> = {
  Pending: "text-amber-700 dark:text-amber-500 bg-amber-500/10",
  Approved: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10",
  Rejected: "text-red-650 bg-red-500/10",
};

export default function ReviewsManager({ reviews, tours }: ReviewsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Review["status"]>("All");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = reviews.filter((r) => {
    const matchesSearch =
      r.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: "Approved" | "Rejected") => {
    setLoading(id);
    setError("");
    const res = await updateReviewStatusAction(id, status);
    setLoading(null);
    if (!res.success) setError(res.error || "Failed to update review.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;
    setLoading(id);
    const res = await deleteReviewAction(id);
    setLoading(null);
    if (!res.success) alert(res.error || "Failed to delete.");
  };

  const exportToCSV = () => {
    const headers = ["Customer Name", "Tour", "Rating", "Status", "Content", "Submitted"];
    const rows = filtered.map((r) => {
      const tour = tours.find((t) => t.id === r.tour_id);
      return [r.customer_name, tour?.title || "Unknown", r.rating, r.status, r.content, r.created_at];
    });
    downloadCsv("Vistana_Reviews_Report", headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-855 shadow-sm">
        <div className="relative flex items-center w-full sm:max-w-xs">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews..."
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-850 dark:text-slate-200"
          />
        </div>

        <div className="flex space-x-2 shrink-0">
          {(["All", "Pending", "Approved", "Rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-bold py-2 px-3 rounded-xl transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400"
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={exportToCSV}
            className="bg-slate-100 dark:bg-slate-850 hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 rounded-xl text-xs flex items-center space-x-1 border border-red-500/10">
          <Info className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl p-10 text-center text-xs text-slate-450 dark:text-slate-500">
          No reviews match this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const tour = tours.find((t) => t.id === r.tour_id);
            return (
              <div
                key={r.id}
                className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center flex-wrap gap-2">
                      <h3 className="font-serif font-bold text-slate-900 dark:text-white">{r.customer_name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[r.status]}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-450">
                      Tour: <span className="font-bold text-slate-600 dark:text-slate-300">{tour?.title || "Unknown"}</span>
                    </p>
                    <div className="flex space-x-0.5 text-amber-400">
                      {[...Array(r.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{r.content}</p>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    {r.status !== "Approved" && (
                      <button
                        onClick={() => handleStatusChange(r.id, "Approved")}
                        disabled={loading === r.id}
                        className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 py-1.5 px-3 rounded-lg flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </button>
                    )}
                    {r.status !== "Rejected" && (
                      <button
                        onClick={() => handleStatusChange(r.id, "Rejected")}
                        disabled={loading === r.id}
                        className="text-xs font-bold text-amber-700 dark:text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 py-1.5 px-3 rounded-lg flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={loading === r.id}
                      className="text-xs font-bold text-red-650 bg-red-500/10 hover:bg-red-500/20 py-1.5 px-3 rounded-lg flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
