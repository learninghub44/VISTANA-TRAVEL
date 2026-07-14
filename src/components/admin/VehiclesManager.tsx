"use client";

import { useState } from "react";
import { saveVehicleAction, deleteVehicleAction } from "@/app/actions";
import { Search, Plus, Trash2, Edit3, X, Info, Car } from "lucide-react";
import { Vehicle } from "@/services/db/types";

interface VehiclesManagerProps {
  vehicles: Vehicle[];
}

const VEHICLE_TYPES: Vehicle["type"][] = ["Safari Land Cruiser", "Tour Van", "Bus", "SUV"];
const VEHICLE_STATUSES: Vehicle["status"][] = ["Available", "Maintenance", "Assigned"];

const statusStyles: Record<Vehicle["status"], string> = {
  Available: "text-emerald-700 bg-emerald-500/10",
  Maintenance: "text-amber-700 bg-amber-500/10",
  Assigned: "text-sky-700 bg-sky-500/10",
};

export default function VehiclesManager({ vehicles }: VehiclesManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editItem, setEditItem] = useState<Partial<Vehicle> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filtered = vehicles.filter(
    (v) =>
      v.driver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.license_plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditItem({
      type: "Safari Land Cruiser",
      capacity: 6,
      driver_name: "",
      license_plate: "",
      status: "Available",
    });
    setError("");
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditItem({ ...v });
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this vehicle?")) return;
    setLoading(true);
    const res = await deleteVehicleAction(id);
    setLoading(false);
    if (!res.success) alert(res.error || "Failed to delete.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setLoading(true);
    setError("");

    const res = await saveVehicleAction({
      type: editItem.type || "Safari Land Cruiser",
      capacity: editItem.capacity || 1,
      driver_name: editItem.driver_name || "",
      license_plate: editItem.license_plate || "",
      status: editItem.status || "Available",
      id: editItem.id,
    } as any);

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to save vehicle.");
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
            placeholder="Search by driver or plate..."
            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-850"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-gold-600 hover:bg-gold-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200/40 rounded-2xl p-10 text-center text-xs text-slate-450">
          No vehicles yet. Add one so it can be assigned to bookings.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((v) => (
            <div
              key={v.id}
              className="bg-white border border-slate-200/40 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm"
            >
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-slate-900 flex items-center space-x-2">
                    <Car className="h-4 w-4 text-gold-600" />
                    <span>{v.type}</span>
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyles[v.status]}`}>
                    {v.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Driver: {v.driver_name || "Unassigned"}</p>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-100">
                  <span className="text-slate-400">Plate: {v.license_plate}</span>
                  <span className="font-bold text-slate-600">{v.capacity} seats</span>
                </div>
              </div>

              <div className="flex bg-slate-50/50 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(v)}
                  className="w-1/2 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center space-x-1 transition-colors border-r border-slate-100 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
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
              {editItem.id ? "Edit Vehicle" : "Add Vehicle"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Vehicle Type</label>
                  <select
                    value={editItem.type || "Safari Land Cruiser"}
                    onChange={(e) => setEditItem({ ...editItem, type: e.target.value as Vehicle["type"] })}
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 cursor-pointer"
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Status</label>
                  <select
                    value={editItem.status || "Available"}
                    onChange={(e) => setEditItem({ ...editItem, status: e.target.value as Vehicle["status"] })}
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800 cursor-pointer"
                  >
                    {VEHICLE_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-405">Driver Name</label>
                <input
                  type="text"
                  required
                  value={editItem.driver_name || ""}
                  onChange={(e) => setEditItem({ ...editItem, driver_name: e.target.value })}
                  placeholder="e.g. James Otieno"
                  className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">License Plate</label>
                  <input
                    type="text"
                    required
                    value={editItem.license_plate || ""}
                    onChange={(e) => setEditItem({ ...editItem, license_plate: e.target.value })}
                    placeholder="KDA 123X"
                    className="bg-slate-50 border-none rounded-xl py-2 px-3 text-xs outline-none text-slate-800"
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-405">Seat Capacity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editItem.capacity ?? 1}
                    onChange={(e) => setEditItem({ ...editItem, capacity: parseInt(e.target.value) || 1 })}
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
                {loading ? "Saving Vehicle..." : "Save Vehicle"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
