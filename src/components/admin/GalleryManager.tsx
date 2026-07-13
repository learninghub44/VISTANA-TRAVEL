"use client";

import { useState } from "react";
import { saveGalleryImageAction, deleteGalleryImageAction, uploadImageAction } from "@/app/actions";
import { Search, Plus, Trash2, X, Info, Upload } from "lucide-react";
import { GalleryImage, Destination } from "@/services/db/types";

interface GalleryManagerProps {
  images: GalleryImage[];
  destinations: Destination[];
}

export default function GalleryManager({ images, destinations }: GalleryManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editItem, setEditItem] = useState<Partial<GalleryImage> | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const filtered = images.filter((g) =>
    (g.caption || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditItem({ image_url: "", caption: "", category: "", destination_id: "" });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    setLoading(true);
    const res = await deleteGalleryImageAction(id);
    setLoading(false);
    if (!res.success) alert(res.error || "Failed to delete.");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editItem) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadImageAction(formData);
      setEditItem({ ...editItem, image_url: res.url });
    } catch (err: any) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    if (!editItem.image_url) {
      setError("Please upload an image or provide an image URL.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await saveGalleryImageAction({
      image_url: editItem.image_url || "",
      caption: editItem.caption || undefined,
      category: editItem.category || undefined,
      destination_id: editItem.destination_id || undefined,
      id: editItem.id,
    } as any);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to save image.");
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
            placeholder="Search by caption..."
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-850 dark:text-slate-200"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Image</span>
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl p-10 text-center text-xs text-slate-450 dark:text-slate-500">
          No gallery images yet. Add one to feature it on the homepage.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((g) => (
            <div
              key={g.id}
              className="bg-white dark:bg-slate-900/60 border border-slate-200/40 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm group relative"
            >
              <img src={g.image_url} alt={g.caption || "Gallery image"} className="w-full h-32 object-cover" />
              <div className="p-3">
                {g.caption && <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">{g.caption}</p>}
              </div>
              <button
                onClick={() => handleDelete(g.id)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-slate-900/90 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
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
              Add Gallery Image
            </h3>

            <form onSubmit={handleSave} className="space-y-4">

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Image</label>
                {editItem.image_url ? (
                  <img src={editItem.image_url} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-emerald-400 transition-colors">
                    <Upload className="h-5 w-5 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-450">{uploading ? "Uploading..." : "Click to upload"}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Caption (optional)</label>
                <input
                  type="text"
                  value={editItem.caption || ""}
                  onChange={(e) => setEditItem({ ...editItem, caption: e.target.value })}
                  placeholder="e.g. Sunrise over the Maasai Mara"
                  className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Category (optional)</label>
                  <input
                    type="text"
                    value={editItem.category || ""}
                    onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                    placeholder="e.g. Wildlife"
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Destination (optional)</label>
                  <select
                    value={editItem.destination_id || ""}
                    onChange={(e) => setEditItem({ ...editItem, destination_id: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-950 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 dark:text-slate-205"
                  >
                    <option value="">None</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
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
                disabled={loading || uploading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-all text-xs cursor-pointer"
              >
                {loading ? "Saving Image..." : "Save Image"}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
