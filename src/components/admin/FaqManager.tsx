"use client";

import { useState } from "react";
import { saveFaqAction, deleteFaqAction } from "@/app/actions";
import { Search, Plus, Trash2, Edit3, X, Info, HelpCircle } from "lucide-react";
import { Faq } from "@/services/db/types";

interface FaqManagerProps {
  faqs: Faq[];
}

export default function FaqManager({ faqs }: FaqManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editItem, setEditItem] = useState<Partial<Faq> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sorted = [...faqs].sort((a, b) => a.order - b.order);
  const filtered = sorted.filter((f) =>
    f.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditItem({
      question: "",
      answer: "",
      category: "",
      order: faqs.length,
    });
    setError("");
  };

  const handleOpenEdit = (f: Faq) => {
    setEditItem({ ...f });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    setLoading(true);
    const res = await deleteFaqAction(id);
    setLoading(false);
    if (!res.success) alert(res.error || "Failed to delete.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setLoading(true);
    setError("");

    const res = await saveFaqAction({
      question: editItem.question || "",
      answer: editItem.answer || "",
      category: editItem.category || undefined,
      order: editItem.order ?? 0,
      id: editItem.id,
    } as any);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to save FAQ.");
    } else {
      setEditItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-850 shadow-sm">
        <div className="relative flex items-center w-full sm:max-w-xs">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-850 dark:text-slate-200"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add FAQ</span>
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl p-10 text-center text-xs text-slate-450 dark:text-slate-500">
          No FAQs yet. Add one to show it on the homepage.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm flex items-start justify-between p-5"
            >
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">{f.question}</h3>
                    {f.category && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">
                        {f.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {f.answer}
                  </p>
                </div>
              </div>

              <div className="flex space-x-1 ml-4 shrink-0">
                <button
                  onClick={() => handleOpenEdit(f)}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Editor */}
      {editItem && (
        <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-150 dark:border-slate-850 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar">

            <button
              onClick={() => setEditItem(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-450 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-105 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-6">
              {editItem.id ? "Edit FAQ" : "Create FAQ"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Question</label>
                <input
                  type="text"
                  required
                  value={editItem.question || ""}
                  onChange={(e) => setEditItem({ ...editItem, question: e.target.value })}
                  placeholder="e.g. Do I need a visa to visit Kenya?"
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Answer</label>
                <textarea
                  required
                  value={editItem.answer || ""}
                  onChange={(e) => setEditItem({ ...editItem, answer: e.target.value })}
                  placeholder="Provide a clear, helpful answer..."
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2.5 px-3 text-xs outline-none text-slate-800 dark:text-slate-205 h-28 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Category (optional)</label>
                  <input
                    type="text"
                    value={editItem.category || ""}
                    onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                    placeholder="e.g. Booking"
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Display Order</label>
                  <input
                    type="number"
                    min={0}
                    value={editItem.order ?? 0}
                    onChange={(e) => setEditItem({ ...editItem, order: parseInt(e.target.value) || 0 })}
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 rounded-xl text-xs flex items-center space-x-1 border border-red-500/10">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-all text-xs cursor-pointer"
              >
                {loading ? "Saving FAQ..." : "Save FAQ"}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
