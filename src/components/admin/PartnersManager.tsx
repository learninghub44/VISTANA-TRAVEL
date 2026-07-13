"use client";

import { useState } from "react";
import { savePartnerAction, deletePartnerAction } from "@/app/actions";
import { Search, Plus, Trash2, Edit3, X, Info, Building2 } from "lucide-react";
import { Partner } from "@/services/db/types";

interface PartnersManagerProps {
  partners: Partner[];
}

export default function PartnersManager({ partners }: PartnersManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editItem, setEditItem] = useState<Partial<Partner> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = partners.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditItem({ name: "", logo_url: "", website_url: "" });
    setError("");
  };

  const handleOpenEdit = (p: Partner) => {
    setEditItem({ ...p });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    setLoading(true);
    const res = await deletePartnerAction(id);
    setLoading(false);
    if (!res.success) alert(res.error || "Failed to delete.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setLoading(true);
    setError("");

    const res = await savePartnerAction({
      name: editItem.name || "",
      logo_url: editItem.logo_url || "",
      website_url: editItem.website_url || undefined,
      id: editItem.id,
    } as any);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to save partner.");
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
            placeholder="Search partners..."
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-850 dark:text-slate-200"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Partner</span>
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl p-10 text-center text-xs text-slate-450 dark:text-slate-500">
          No partners yet. Add one to display it on the homepage.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm"
            >
              <div className="p-5 flex flex-col items-center text-center space-y-3">
                <div className="h-14 w-full flex items-center justify-center">
                  {p.logo_url ? (
                    <img src={p.logo_url} alt={p.name} className="h-10 max-w-full object-contain" />
                  ) : (
                    <Building2 className="h-8 w-8 text-slate-350" />
                  )}
                </div>
                <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">{p.name}</h3>
              </div>

              <div className="flex bg-slate-50/50 dark:bg-slate-955/10 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="w-1/2 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center space-x-1 transition-colors border-r border-slate-100 dark:border-slate-800/80 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
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
              {editItem.id ? "Edit Partner" : "Create Partner"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Partner Name</label>
                <input
                  type="text"
                  required
                  value={editItem.name || ""}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  placeholder="e.g. Kenya Tourism Board"
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Logo URL</label>
                <input
                  type="text"
                  value={editItem.logo_url || ""}
                  onChange={(e) => setEditItem({ ...editItem, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Website URL (optional)</label>
                <input
                  type="text"
                  value={editItem.website_url || ""}
                  onChange={(e) => setEditItem({ ...editItem, website_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                />
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
                {loading ? "Saving Partner..." : "Save Partner"}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
