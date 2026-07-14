"use client";

import { useState } from "react";
import { saveDestinationAction, deleteDestinationAction } from "@/app/actions";
import { Map, Search, Plus, Trash2, Edit3, X, Info } from "lucide-react";
import { Destination } from "@/services/db/types";

interface DestinationsManagerProps {
  destinations: Destination[];
}

export default function DestinationsManager({ destinations }: DestinationsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editDest, setEditDest] = useState<Partial<Destination> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredDests = destinations.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditDest({
      name: "",
      slug: "",
      overview: "",
      images: [""],
      attractions: [""],
      activities: [""],
      weather: "Moderate",
      latitude: 0,
      longitude: 0,
      travel_tips: [{ title: "", content: "" }],
    });
    setError("");
  };

  const handleOpenEdit = (d: Destination) => {
    setEditDest({ ...d });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination? All linked tours will lose connection.")) return;
    setLoading(true);
    const res = await deleteDestinationAction(id);
    setLoading(false);
    if (!res.success) alert(res.error || "Failed to delete.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDest) return;
    setLoading(true);
    setError("");

    const cleanedImages = (editDest.images || []).filter((url) => !!url.trim());
    if (cleanedImages.length === 0) {
      cleanedImages.push("https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80");
    }

    const cleanedAttractions = (editDest.attractions || []).filter((v) => !!v.trim());
    const cleanedActivities = (editDest.activities || []).filter((v) => !!v.trim());
    const cleanedTips = (editDest.travel_tips || []).filter((t) => !!t.title.trim() && !!t.content.trim());

    const res = await saveDestinationAction({
      name: editDest.name || "",
      slug: editDest.slug || "",
      overview: editDest.overview || "",
      images: cleanedImages,
      attractions: cleanedAttractions,
      activities: cleanedActivities,
      weather: editDest.weather || "Moderate",
      latitude: editDest.latitude || 0,
      longitude: editDest.longitude || 0,
      travel_tips: cleanedTips,
      id: editDest.id,
    } as any);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to save destination.");
    } else {
      setEditDest(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/40 shadow-sm">
        <div className="relative flex items-center w-full sm:max-w-xs">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations..."
            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-850"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-gold-600 hover:bg-gold-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Destination</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredDests.map((d) => (
          <div
            key={d.id}
            className="bg-white border border-slate-200/40 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm"
          >
            <div className="p-5 space-y-2">
              <h3 className="font-serif font-bold text-lg text-slate-900">{d.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {d.overview}
              </p>
            </div>
            
            <div className="flex bg-slate-50/50 border-t border-slate-100">
              <button
                onClick={() => handleOpenEdit(d)}
                className="w-1/2 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center space-x-1 transition-colors border-r border-slate-100 cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(d.id)}
                className="w-1/2 py-2 text-xs font-bold text-red-650 hover:bg-red-50 flex items-center justify-center space-x-1 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Editor */}
      {editDest && (
        <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-150 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            <button
              onClick={() => setEditDest(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-450 hover:text-slate-800 rounded-full hover:bg-slate-105 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-slate-900 mb-6">
              {editDest.id ? "Edit Destination" : "Create Destination"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Destination Name</label>
                <input
                  type="text"
                  required
                  value={editDest.name || ""}
                  onChange={(e) => setEditDest({ ...editDest, name: e.target.value })}
                  placeholder="e.g. Serengeti National Park"
                  className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Overview</label>
                <textarea
                  required
                  value={editDest.overview || ""}
                  onChange={(e) => setEditDest({ ...editDest, overview: e.target.value })}
                  placeholder="Overview details..."
                  className="bg-slate-50 border-none rounded-xl py-2.5 px-3 text-xs outline-none text-slate-800 h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editDest.latitude || 0}
                    onChange={(e) => setEditDest({ ...editDest, latitude: parseFloat(e.target.value) })}
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editDest.longitude || 0}
                    onChange={(e) => setEditDest({ ...editDest, longitude: parseFloat(e.target.value) })}
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Attractions (Comma separated)</label>
                <input
                  type="text"
                  value={(editDest.attractions || []).join(", ")}
                  onChange={(e) => setEditDest({ ...editDest, attractions: e.target.value.split(",").map((v) => v.trim()) })}
                  placeholder="Mara River, Musiara Swamp..."
                  className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Activities (Comma separated)</label>
                <input
                  type="text"
                  value={(editDest.activities || []).join(", ")}
                  onChange={(e) => setEditDest({ ...editDest, activities: e.target.value.split(",").map((v) => v.trim()) })}
                  placeholder="Game Drives, Hot Air Balloon..."
                  className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Climate & Weather</label>
                <input
                  type="text"
                  value={editDest.weather || ""}
                  onChange={(e) => setEditDest({ ...editDest, weather: e.target.value })}
                  placeholder="Warm during day (25-30°C)..."
                  className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                />
              </div>

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
                {loading ? "Saving Destination..." : "Save Destination Details"}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
