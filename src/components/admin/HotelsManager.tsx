"use client";

import { useState } from "react";
import { saveHotelAction, deleteHotelAction } from "@/app/actions";
import { Search, Plus, Trash2, Edit3, X, Info, Hotel as HotelIcon, Star, PlusCircle } from "lucide-react";
import { Hotel } from "@/services/db/types";

interface HotelsManagerProps {
  hotels: Hotel[];
}

type RoomType = { name: string; price_usd: number; capacity: number };

export default function HotelsManager({ hotels }: HotelsManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editItem, setEditItem] = useState<Partial<Hotel> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = hotels.filter((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleOpenAdd = () => {
    setEditItem({
      name: "",
      star_rating: 4,
      images: [""],
      room_types: [{ name: "", price_usd: 100, capacity: 2 }],
      amenities: [""],
      contact_details: { phone: "", email: "", website: "" },
      latitude: 0,
      longitude: 0,
    });
    setError("");
  };

  const handleOpenEdit = (h: Hotel) => {
    setEditItem({ ...h });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;
    setLoading(true);
    const res = await deleteHotelAction(id);
    setLoading(false);
    if (!res.success) alert(res.error || "Failed to delete.");
  };

  const updateRoomType = (idx: number, field: keyof RoomType, value: string | number) => {
    const rooms = [...(editItem?.room_types || [])];
    rooms[idx] = { ...rooms[idx], [field]: value };
    setEditItem({ ...editItem, room_types: rooms });
  };

  const addRoomType = () => {
    setEditItem({
      ...editItem,
      room_types: [...(editItem?.room_types || []), { name: "", price_usd: 100, capacity: 2 }],
    });
  };

  const removeRoomType = (idx: number) => {
    const rooms = [...(editItem?.room_types || [])];
    rooms.splice(idx, 1);
    setEditItem({ ...editItem, room_types: rooms });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setLoading(true);
    setError("");

    const cleanedImages = (editItem.images || []).filter((url) => !!url.trim());
    if (cleanedImages.length === 0) {
      cleanedImages.push("https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80");
    }
    const cleanedAmenities = (editItem.amenities || []).filter((v) => !!v.trim());
    const cleanedRooms = (editItem.room_types || []).filter((r) => !!r.name.trim());

    const res = await saveHotelAction({
      name: editItem.name || "",
      star_rating: editItem.star_rating || 3,
      images: cleanedImages,
      room_types: cleanedRooms.length > 0 ? cleanedRooms : [{ name: "Standard Room", price_usd: 100, capacity: 2 }],
      amenities: cleanedAmenities,
      contact_details: {
        phone: editItem.contact_details?.phone || "",
        email: editItem.contact_details?.email || "",
        website: editItem.contact_details?.website || undefined,
      },
      latitude: editItem.latitude || 0,
      longitude: editItem.longitude || 0,
      id: editItem.id,
    } as any);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to save hotel.");
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
            placeholder="Search hotels..."
            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-850"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-gold-600 hover:bg-gold-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Hotel</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200/40 rounded-2xl p-10 text-center text-xs text-slate-450">
          No hotel partners yet. Add one to make it available for bookings.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((h) => (
            <div
              key={h.id}
              className="bg-white border border-slate-200/40 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm"
            >
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center space-x-2">
                    <HotelIcon className="h-4 w-4 text-gold-600" />
                    <span>{h.name}</span>
                  </h3>
                </div>
                <div className="flex space-x-0.5 text-amber-400">
                  {[...Array(h.star_rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  {h.room_types.length} room type{h.room_types.length !== 1 ? "s" : ""} from $
                  {Math.min(...h.room_types.map((r) => r.price_usd)).toLocaleString()}
                </p>
              </div>

              <div className="flex bg-slate-50/50 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(h)}
                  className="w-1/2 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center space-x-1 transition-colors border-r border-slate-100 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(h.id)}
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
        <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 border border-slate-150 shadow-2xl relative my-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setEditItem(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-450 hover:text-slate-800 rounded-full hover:bg-slate-105 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-slate-900 mb-6">
              {editItem.id ? "Edit Hotel" : "Add Hotel"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Hotel Name</label>
                  <input
                    type="text"
                    required
                    value={editItem.name || ""}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    placeholder="e.g. Mara Serena Safari Lodge"
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Star Rating</label>
                  <select
                    value={editItem.star_rating ?? 4}
                    onChange={(e) => setEditItem({ ...editItem, star_rating: parseInt(e.target.value) })}
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>{s} Star</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Cover Image URL</label>
                <input
                  type="text"
                  value={(editItem.images || [])[0] || ""}
                  onChange={(e) => setEditItem({ ...editItem, images: [e.target.value, ...(editItem.images || []).slice(1)] })}
                  placeholder="https://..."
                  className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Amenities (Comma separated)</label>
                <input
                  type="text"
                  value={(editItem.amenities || []).join(", ")}
                  onChange={(e) => setEditItem({ ...editItem, amenities: e.target.value.split(",").map((v) => v.trim()) })}
                  placeholder="Pool, Spa, Wi-Fi, Game Drives..."
                  className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                />
              </div>

              {/* Room Types */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Room Types</label>
                  <button
                    type="button"
                    onClick={addRoomType}
                    className="text-[10px] font-bold text-gold-600 flex items-center space-x-1 cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add Room Type</span>
                  </button>
                </div>
                {(editItem.room_types || []).map((r, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_90px_70px_28px] gap-2 items-center">
                    <input
                      type="text"
                      value={r.name}
                      onChange={(e) => updateRoomType(idx, "name", e.target.value)}
                      placeholder="Room name"
                      className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                    />
                    <input
                      type="number"
                      value={r.price_usd}
                      onChange={(e) => updateRoomType(idx, "price_usd", parseInt(e.target.value) || 0)}
                      placeholder="Price"
                      className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                    />
                    <input
                      type="number"
                      value={r.capacity}
                      onChange={(e) => updateRoomType(idx, "capacity", parseInt(e.target.value) || 1)}
                      placeholder="Cap."
                      className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => removeRoomType(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Contact Phone</label>
                  <input
                    type="text"
                    value={editItem.contact_details?.phone || ""}
                    onChange={(e) => setEditItem({ ...editItem, contact_details: { ...editItem.contact_details, phone: e.target.value, email: editItem.contact_details?.email || "" } })}
                    placeholder="+254 7XX XXX XXX"
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Contact Email</label>
                  <input
                    type="email"
                    value={editItem.contact_details?.email || ""}
                    onChange={(e) => setEditItem({ ...editItem, contact_details: { ...editItem.contact_details, email: e.target.value, phone: editItem.contact_details?.phone || "" } })}
                    placeholder="reservations@hotel.com"
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editItem.latitude || 0}
                    onChange={(e) => setEditItem({ ...editItem, latitude: parseFloat(e.target.value) })}
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editItem.longitude || 0}
                    onChange={(e) => setEditItem({ ...editItem, longitude: parseFloat(e.target.value) })}
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                  />
                </div>
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
                {loading ? "Saving Hotel..." : "Save Hotel"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
