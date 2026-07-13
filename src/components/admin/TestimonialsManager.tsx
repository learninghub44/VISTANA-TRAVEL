"use client";

import { useState } from "react";
import { saveTestimonialAction, deleteTestimonialAction } from "@/app/actions";
import { Search, Plus, Trash2, Edit3, X, Info, Star } from "lucide-react";
import { Testimonial } from "@/services/db/types";

interface TestimonialsManagerProps {
  testimonials: Testimonial[];
}

export default function TestimonialsManager({ testimonials }: TestimonialsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editItem, setEditItem] = useState<Partial<Testimonial> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = testimonials.filter((t) =>
    t.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditItem({
      customer_name: "",
      customer_location: "",
      avatar_url: "",
      content: "",
      rating: 5,
      featured: true,
    });
    setError("");
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditItem({ ...t });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    setLoading(true);
    const res = await deleteTestimonialAction(id);
    setLoading(false);
    if (!res.success) alert(res.error || "Failed to delete.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setLoading(true);
    setError("");

    const res = await saveTestimonialAction({
      customer_name: editItem.customer_name || "",
      customer_location: editItem.customer_location || undefined,
      avatar_url: editItem.avatar_url || undefined,
      content: editItem.content || "",
      rating: editItem.rating || 5,
      featured: editItem.featured ?? true,
      id: editItem.id,
    } as any);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to save testimonial.");
    } else {
      setEditItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-855 shadow-sm">
        <div className="relative flex items-center w-full sm:max-w-xs">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search testimonials..."
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-850 dark:text-slate-200"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl p-10 text-center text-xs text-slate-450 dark:text-slate-500">
          No testimonials yet. Add one to feature it on the homepage.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm"
            >
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{t.customer_name}</h3>
                  {t.featured && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                {t.customer_location && (
                  <p className="text-[10px] uppercase tracking-wider text-slate-450 font-semibold">{t.customer_location}</p>
                )}
                <div className="flex space-x-0.5 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed italic">
                  "{t.content}"
                </p>
              </div>

              <div className="flex bg-slate-50/50 dark:bg-slate-955/10 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="w-1/2 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center space-x-1 transition-colors border-r border-slate-100 dark:border-slate-800/80 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="w-1/2 py-2 text-xs font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-955/20 flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
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
              {editItem.id ? "Edit Testimonial" : "Create Testimonial"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Customer Name</label>
                <input
                  type="text"
                  required
                  value={editItem.customer_name || ""}
                  onChange={(e) => setEditItem({ ...editItem, customer_name: e.target.value })}
                  placeholder="e.g. Arthur & Elena Rostova"
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Location / Country</label>
                <input
                  type="text"
                  value={editItem.customer_location || ""}
                  onChange={(e) => setEditItem({ ...editItem, customer_location: e.target.value })}
                  placeholder="e.g. Switzerland"
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Avatar URL (optional)</label>
                <input
                  type="text"
                  value={editItem.avatar_url || ""}
                  onChange={(e) => setEditItem({ ...editItem, avatar_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Testimonial Content</label>
                <textarea
                  required
                  value={editItem.content || ""}
                  onChange={(e) => setEditItem({ ...editItem, content: e.target.value })}
                  placeholder="What the guest said..."
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2.5 px-3 text-xs outline-none text-slate-800 dark:text-slate-205 h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Rating (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editItem.rating ?? 5}
                    onChange={(e) => setEditItem({ ...editItem, rating: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) })}
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                  />
                </div>
                <div className="flex flex-col space-y-1 justify-center">
                  <label className="text-[10px] uppercase font-bold text-slate-405 mb-1">Featured on Homepage</label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editItem.featured ?? true}
                      onChange={(e) => setEditItem({ ...editItem, featured: e.target.checked })}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400">Show on homepage</span>
                  </label>
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
                {loading ? "Saving Testimonial..." : "Save Testimonial"}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
