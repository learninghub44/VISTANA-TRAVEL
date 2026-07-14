"use client";

import { useState } from "react";
import { saveGuideAction, deleteGuideAction } from "@/app/actions";
import { Search, Plus, Trash2, Edit3, X, Info, UserCheck, Star } from "lucide-react";
import { Guide } from "@/services/db/types";

interface GuidesManagerProps {
  guides: Guide[];
}

export default function GuidesManager({ guides }: GuidesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editItem, setEditItem] = useState<Partial<Guide> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = guides.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditItem({
      name: "",
      languages: ["English", "Swahili"],
      experience_years: 1,
      availability: true,
      rating: 5,
      image_url: "",
    });
    setError("");
  };

  const handleOpenEdit = (g: Guide) => {
    setEditItem({ ...g });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this guide? Any bookings referencing them will keep the reference.")) return;
    setLoading(true);
    const res = await deleteGuideAction(id);
    setLoading(false);
    if (!res.success) alert(res.error || "Failed to delete.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setLoading(true);
    setError("");

    const cleanedLanguages = (editItem.languages || []).filter((v) => !!v.trim());

    const res = await saveGuideAction({
      name: editItem.name || "",
      languages: cleanedLanguages.length > 0 ? cleanedLanguages : ["English"],
      experience_years: editItem.experience_years || 0,
      availability: editItem.availability ?? true,
      rating: editItem.rating ?? 5,
      image_url: editItem.image_url || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=400&q=80",
      id: editItem.id,
    } as any);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to save guide.");
    } else {
      setEditItem(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/40 shadow-sm">
        <div className="relative flex items-center w-full sm:max-w-xs">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides..."
            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-850"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-gold-600 hover:bg-gold-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Guide</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200/40 rounded-2xl p-10 text-center text-xs text-slate-450">
          No guides yet. Add one so they can be assigned to bookings.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((g) => (
            <div
              key={g.id}
              className="bg-white border border-slate-200/40 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm"
            >
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-slate-900">{g.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      g.availability
                        ? "text-emerald-700 bg-emerald-500/10"
                        : "text-red-650 bg-red-500/10"
                    }`}
                  >
                    {g.availability ? "Available" : "Unavailable"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-450">{g.languages.join(", ")}</p>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-400">{g.experience_years} yrs experience</span>
                  <span className="flex items-center space-x-1 text-amber-600 font-bold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    <span>{g.rating}</span>
                  </span>
                </div>
              </div>

              <div className="flex bg-slate-50/50 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(g)}
                  className="w-1/2 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center space-x-1 transition-colors border-r border-slate-100 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(g.id)}
                  className="w-1/2 py-2 text-xs font-bold text-red-650 hover:bg-red-50 flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editItem && (
        <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-150 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setEditItem(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-450 hover:text-slate-800 rounded-full hover:bg-slate-105 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-slate-900 mb-6">
              {editItem.id ? "Edit Guide" : "Add Guide"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Full Name</label>
                <input
                  type="text"
                  required
                  value={editItem.name || ""}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  placeholder="e.g. David Kimani"
                  className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Languages (Comma separated)</label>
                <input
                  type="text"
                  value={(editItem.languages || []).join(", ")}
                  onChange={(e) => setEditItem({ ...editItem, languages: e.target.value.split(",").map((v) => v.trim()) })}
                  placeholder="English, Swahili, French..."
                  className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    value={editItem.experience_years ?? 0}
                    onChange={(e) => setEditItem({ ...editItem, experience_years: parseInt(e.target.value) || 0 })}
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Rating (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={editItem.rating ?? 5}
                    onChange={(e) => setEditItem({ ...editItem, rating: parseFloat(e.target.value) || 1 })}
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Photo URL</label>
                <input
                  type="text"
                  value={editItem.image_url || ""}
                  onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })}
                  placeholder="https://..."
                  className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                />
              </div>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editItem.availability ?? true}
                  onChange={(e) => setEditItem({ ...editItem, availability: e.target.checked })}
                  className="h-4 w-4 accent-gold-600"
                />
                <span className="text-xs text-slate-600">Currently available for bookings</span>
              </label>

              {error && (
                <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs flex items-center space-x-1 border border-red-500/10">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-all text-xs cursor-pointer"
              >
                {loading ? "Saving Guide..." : "Save Guide"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
