"use client";

import { useState } from "react";
import { saveTourAction, deleteTourAction } from "@/app/actions";
import { Compass, Search, Plus, Trash2, Edit3, X, Info } from "lucide-react";
import { Tour, Destination } from "@/services/db/types";

interface ToursManagerProps {
  tours: Tour[];
  destinations: Destination[];
}

export default function ToursManager({ tours, destinations }: ToursManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editTour, setEditTour] = useState<Partial<Tour> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredTours = tours.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditTour({
      title: "",
      slug: "",
      description: "",
      images: [""],
      duration_days: 5,
      price_usd: 1500,
      category: "Safari",
      difficulty: "Easy",
      inclusions: [""],
      exclusions: [""],
      pickup_location: "",
      dropoff_location: "",
      max_guests: 10,
      min_guests: 2,
      languages: ["English", "Swahili"],
      faqs: [{ question: "", answer: "" }],
      itinerary: [{ day: 1, title: "", description: "" }],
    });
    setError("");
  };

  const handleOpenEdit = (t: Tour) => {
    setEditTour({ ...t });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tour package?")) return;
    setLoading(true);
    const res = await deleteTourAction(id);
    setLoading(false);
    if (!res.success) alert(res.error || "Failed to delete.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTour) return;
    setLoading(true);
    setError("");

    // Validate images and clean empty entries
    const cleanedImages = (editTour.images || []).filter((url) => !!url.trim());
    if (cleanedImages.length === 0) {
      cleanedImages.push("https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80");
    }

    const cleanedInclusions = (editTour.inclusions || []).filter((v) => !!v.trim());
    const cleanedExclusions = (editTour.exclusions || []).filter((v) => !!v.trim());
    const cleanedFaqs = (editTour.faqs || []).filter((f) => !!f.question.trim() && !!f.answer.trim());
    const cleanedItinerary = (editTour.itinerary || [])
      .filter((it) => !!it.title.trim())
      .map((it, idx) => ({ ...it, day: idx + 1 }));

    if (!editTour.destination_id && destinations.length > 0) {
      editTour.destination_id = destinations[0].id;
    }

    const res = await saveTourAction({
      destination_id: editTour.destination_id || "",
      title: editTour.title || "",
      slug: editTour.slug || "",
      description: editTour.description || "",
      images: cleanedImages,
      duration_days: editTour.duration_days || 1,
      price_usd: editTour.price_usd || 100,
      category: editTour.category || "Safari",
      difficulty: editTour.difficulty || "Easy",
      inclusions: cleanedInclusions,
      exclusions: cleanedExclusions,
      pickup_location: editTour.pickup_location || "",
      dropoff_location: editTour.dropoff_location || "",
      max_guests: editTour.max_guests || 10,
      min_guests: editTour.min_guests || 1,
      languages: editTour.languages || ["English"],
      faqs: cleanedFaqs,
      itinerary: cleanedItinerary,
      guide_id: editTour.guide_id || undefined,
      id: editTour.id,
    } as any);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to save tour.");
    } else {
      setEditTour(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-855 shadow-sm">
        <div className="relative flex items-center w-full sm:max-w-xs">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tours..."
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-805 dark:text-slate-200"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-gold-600 hover:bg-gold-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Tour Package</span>
        </button>
      </div>

      {/* Grid of Tours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredTours.map((t) => {
          const dest = destinations.find((d) => d.id === t.destination_id);
          return (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-5 space-y-3">
                <span className="text-[10px] bg-gold-500/10 text-gold-700 dark:text-gold-400 px-2 py-0.5 rounded font-bold uppercase">
                  {t.category}
                </span>
                <h3 className="font-serif font-bold text-slate-900 dark:text-white line-clamp-1">{t.title}</h3>
                <p className="text-[10px] text-slate-400">
                  Destination: <span className="font-bold text-slate-600 dark:text-slate-300">{dest?.name || "N/A"}</span>
                </p>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">{t.duration_days} Days</span>
                  <span className="font-bold text-amber-705 dark:text-amber-500">${t.price_usd.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="w-1/2 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center space-x-1 transition-colors border-r border-slate-100 dark:border-slate-800/80 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="w-1/2 py-2 text-xs font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/10 flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Modal */}
      {editTour && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-150 dark:border-slate-850 shadow-2xl relative my-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            <button
              onClick={() => setEditTour(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-450 hover:text-slate-800 dark:hover:text-white rounded-full hover:bg-slate-105 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-6">
              {editTour.id ? "Edit Tour Details" : "Create Tour Package"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Tour Title</label>
                  <input
                    type="text"
                    required
                    value={editTour.title || ""}
                    onChange={(e) => setEditTour({ ...editTour, title: e.target.value })}
                    placeholder="e.g. 5-Day Zanzibar Escape"
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Destination</label>
                  <select
                    value={editTour.destination_id || ""}
                    onChange={(e) => setEditTour({ ...editTour, destination_id: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205 cursor-pointer"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Category</label>
                  <input
                    type="text"
                    required
                    value={editTour.category || ""}
                    onChange={(e) => setEditTour({ ...editTour, category: e.target.value })}
                    placeholder="Safari, Beach Holiday..."
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Difficulty</label>
                  <select
                    value={editTour.difficulty || "Easy"}
                    onChange={(e) => setEditTour({ ...editTour, difficulty: e.target.value as any })}
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205 cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                    <option value="Challenging">Challenging</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Price (USD)</label>
                  <input
                    type="number"
                    required
                    value={editTour.price_usd || 0}
                    onChange={(e) => setEditTour({ ...editTour, price_usd: parseInt(e.target.value) })}
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    value={editTour.duration_days || 0}
                    onChange={(e) => setEditTour({ ...editTour, duration_days: parseInt(e.target.value) })}
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Tour Description</label>
                <textarea
                  required
                  value={editTour.description || ""}
                  onChange={(e) => setEditTour({ ...editTour, description: e.target.value })}
                  placeholder="Overview details..."
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205 h-20 resize-none"
                />
              </div>

              {/* Inclusions Split */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Inclusions (Comma separated)</label>
                <input
                  type="text"
                  value={(editTour.inclusions || []).join(", ")}
                  onChange={(e) => setEditTour({ ...editTour, inclusions: e.target.value.split(",").map((v) => v.trim()) })}
                  placeholder="Lodging, Transport, Guide, Entry..."
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                />
              </div>

              {/* Exclusions Split */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Exclusions (Comma separated)</label>
                <input
                  type="text"
                  value={(editTour.exclusions || []).join(", ")}
                  onChange={(e) => setEditTour({ ...editTour, exclusions: e.target.value.split(",").map((v) => v.trim()) })}
                  placeholder="Visas, Flights, Tips..."
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
                className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-all text-xs cursor-pointer"
              >
                {loading ? "Saving Package..." : "Save Tour Details"}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
