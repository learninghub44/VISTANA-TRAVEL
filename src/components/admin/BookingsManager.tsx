"use client";

import { useState } from "react";
import { updateBookingStatusAction } from "@/app/actions";
import { downloadCsv } from "@/lib/csv";
import { ClipboardList, Users, Search, Download, Printer, UserCheck, Car, RefreshCw, Info, Edit3, X } from "lucide-react";
import { Booking, Tour, Guide, Vehicle, Profile } from "@/services/db/types";

interface BookingsManagerProps {
  bookings: Booking[];
  tours: Tour[];
  guides: Guide[];
  vehicles: Vehicle[];
  profiles: Profile[];
}

export default function BookingsManager({ bookings, tours, guides, vehicles, profiles }: BookingsManagerProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  
  // Edit form states
  const [editStatus, setEditStatus] = useState<Booking["status"]>("Pending");
  const [editGuideId, setEditGuideId] = useState<string>("");
  const [editVehicleId, setEditVehicleId] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = selectedStatus ? b.status === selectedStatus : true;
    
    const tour = tours.find((t) => t.id === b.tour_id);
    const customer = profiles.find((p) => p.id === b.customer_id);
    const matchesSearch = searchQuery
      ? b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer?.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "text-amber-700 bg-amber-50 border-amber-500/10",
      Confirmed: "text-blue-700 bg-blue-50 border-blue-500/10",
      "Awaiting Payment": "text-purple-700 bg-purple-50 border-purple-500/10",
      Paid: "text-emerald-700 bg-emerald-50 border-emerald-500/10",
      Completed: "text-slate-700 bg-slate-50 border-slate-700/10",
      Cancelled: "text-red-700 bg-red-50 border-red-500/10",
    };
    return colors[status] || "text-slate-500 bg-slate-50 border-slate-200/20";
  };

  const handleOpenEdit = (b: Booking) => {
    setEditBooking(b);
    setEditStatus(b.status);
    setEditGuideId(b.guide_id || "");
    setEditVehicleId(b.vehicle_id || "");
    setMessage(null);
  };

  const handleSaveUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBooking) return;
    setLoading(true);
    setMessage(null);

    const res = await updateBookingStatusAction(editBooking.id, {
      status: editStatus,
      guideId: editGuideId || "",
      vehicleId: editVehicleId || "",
    });

    setLoading(false);
    if (!res.success) {
      setMessage({ type: "error", text: res.error || "Failed to update booking." });
    } else {
      setMessage({ type: "success", text: "Booking updated and client notified successfully!" });
      setTimeout(() => setEditBooking(null), 1500);
    }
  };

  // Export report to CSV Client-Side
  const exportToCSV = () => {
    const headers = ["Booking ID", "Customer Name", "Customer Email", "Tour Package", "Travel Date", "Adults", "Children", "Total Price", "Status", "Created At"];
    const rows = filteredBookings.map((b) => {
      const tour = tours.find((t) => t.id === b.tour_id);
      const cust = profiles.find((p) => p.id === b.customer_id);
      return [
        b.id,
        cust?.name || "Guest",
        cust?.email || "",
        tour?.title || "",
        b.start_date,
        b.adults,
        b.children,
        b.total_price,
        b.status,
        b.created_at,
      ];
    });

    downloadCsv("Vistana_Bookings_Report", headers, rows);
  };

  const printBookingSheet = (b: Booking) => {
    const tour = tours.find((t) => t.id === b.tour_id);
    const cust = profiles.find((p) => p.id === b.customer_id);
    const guide = guides.find((g) => g.id === b.guide_id);
    const vehicle = vehicles.find((v) => v.id === b.vehicle_id);

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Confirmation - Vistana Tours (${b.id})</title>
          <style>
            body { font-family: sans-serif; color: #333; margin: 40px; }
            .header { border-bottom: 2px solid #064e3b; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { color: #064e3b; margin: 0; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; font-size: 14px; text-transform: uppercase; color: #666; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; }
            .label { color: #888; font-size: 12px; }
            .value { font-weight: bold; font-size: 13px; margin-top: 2px; }
            .total { font-size: 18px; color: #b45309; font-weight: bold; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <h1>Vistana Tours & Travel</h1>
            <p>Safari & Holiday Booking Details Sheet</p>
          </div>
          <div class="section">
            <div class="section-title">Booking Summary</div>
            <div class="grid">
              <div>
                <div class="label">Booking Reference ID</div>
                <div class="value">${b.id}</div>
              </div>
              <div>
                <div class="label">Booking Status</div>
                <div class="value">${b.status}</div>
              </div>
              <div>
                <div class="label">Tour Package</div>
                <div class="value">${tour?.title || "N/A"}</div>
              </div>
              <div>
                <div class="label">Duration</div>
                <div class="value">${tour?.duration_days || "N/A"} Days</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Passenger Details</div>
            <div class="grid">
              <div>
                <div class="label">Name</div>
                <div class="value">${cust?.name || "N/A"}</div>
              </div>
              <div>
                <div class="label">Email Address</div>
                <div class="value">${cust?.email || "N/A"}</div>
              </div>
              <div>
                <div class="label">Phone Number</div>
                <div class="value">${cust?.phone || "N/A"}</div>
              </div>
              <div>
                <div class="label">Group Size</div>
                <div class="value">${b.adults} Adults, ${b.children} Children</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Travel logistics & Costs</div>
            <div class="grid">
              <div>
                <div class="label">Start Date</div>
                <div class="value">${b.start_date}</div>
              </div>
              <div>
                <div class="label">End Date</div>
                <div class="value">${b.end_date}</div>
              </div>
              <div>
                <div class="label">Assigned Guide</div>
                <div class="value">${guide?.name || "None Allocated Yet"}</div>
              </div>
              <div>
                <div class="label">Assigned Vehicle</div>
                <div class="value">${vehicle ? vehicle.type + ' (' + vehicle.license_plate + ')' : "None Allocated Yet"}</div>
              </div>
              <div>
                <div class="label">Total Price</div>
                <div class="value total">$${b.total_price.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/40 shadow-sm">
        
        {/* Search */}
        <div className="relative flex items-center w-full sm:max-w-xs">
          <Search className="absolute left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, customer or tour..."
            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs outline-none text-slate-805"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0 justify-end">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border-none text-slate-700 py-2 px-4 rounded-xl text-xs outline-none font-semibold cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Awaiting Payment">Awaiting Payment</option>
            <option value="Paid">Paid</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={exportToCSV}
            className="bg-gold-600 hover:bg-gold-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-1.5 shadow transition-colors shrink-0 cursor-pointer"
            title="Export csv data"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* Bookings Table List */}
      <div className="bg-white rounded-3xl border border-slate-200/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 pl-4 font-bold uppercase tracking-wider">Ref ID</th>
                <th className="py-4 font-bold uppercase tracking-wider">Customer</th>
                <th className="py-4 font-bold uppercase tracking-wider">Tour details</th>
                <th className="py-4 font-bold uppercase tracking-wider">Travel dates</th>
                <th className="py-4 font-bold uppercase tracking-wider">Assigned staff</th>
                <th className="py-4 font-bold uppercase tracking-wider">Cost</th>
                <th className="py-4 font-bold uppercase tracking-wider">Status</th>
                <th className="py-4 pr-4 text-center font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const tour = tours.find((t) => t.id === b.tour_id);
                const cust = profiles.find((p) => p.id === b.customer_id);
                const guide = guides.find((g) => g.id === b.guide_id);
                const vehicle = vehicles.find((v) => v.id === b.vehicle_id);

                return (
                  <tr
                    key={b.id}
                    className="border-b border-slate-100 hover:bg-slate-50/40"
                  >
                    <td className="py-4 pl-4 font-mono font-bold">{b.id}</td>
                    <td className="py-4">
                      {cust ? (
                        <div>
                          <span className="font-bold text-slate-850 block">{cust.name}</span>
                          <span className="text-[10px] text-slate-400 block">{cust.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-405 italic">Guest User</span>
                      )}
                    </td>
                    <td className="py-4">
                      {tour ? (
                        <div>
                          <span className="font-semibold text-slate-800 block max-w-[150px] truncate">{tour.title}</span>
                          <span className="text-[10px] text-slate-400 block">{b.adults} Ad, {b.children} Ch</span>
                        </div>
                      ) : (
                        <span className="text-slate-405 italic">N/A</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className="font-medium text-slate-700 block">{b.start_date}</span>
                      <span className="text-[10px] text-slate-400 block">to {b.end_date}</span>
                    </td>
                    <td className="py-4">
                      <div className="space-y-0.5 text-[10px] text-slate-500">
                        {guide && (
                          <span className="flex items-center text-gold-600">
                            <UserCheck className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[100px]">{guide.name}</span>
                          </span>
                        )}
                        {vehicle && (
                          <span className="flex items-center text-blue-600">
                            <Car className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[100px]">{vehicle.license_plate}</span>
                          </span>
                        )}
                        {!guide && !vehicle && <span className="italic text-slate-400">Unallocated</span>}
                      </div>
                    </td>
                    <td className="py-4 font-bold text-amber-700">
                      ${b.total_price.toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 bg-slate-100 hover:bg-gold-50 text-slate-500 hover:text-gold-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit booking parameters"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => printBookingSheet(b)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Print sheet"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                    No bookings found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit booking side modal */}
      {editBooking && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-150 shadow-2xl relative">
            
            <button
              onClick={() => setEditBooking(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-450 hover:text-slate-800 rounded-full hover:bg-slate-105 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-slate-900 mb-2 flex items-center space-x-1.5">
              <ClipboardList className="h-5 w-5 text-gold-500" />
              <span>Update Booking Logistics ({editBooking.id})</span>
            </h3>
            <p className="text-[10px] text-slate-400 mb-6">
              Review allocations and update approval states.
            </p>

            {editBooking.document_urls && editBooking.document_urls.length > 0 && (
              <div className="mb-4 flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Customer Documents
                </label>
                <div className="flex flex-wrap gap-2">
                  {editBooking.document_urls.map((url, i) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-slate-50 hover:bg-gold-50 text-gold-700 rounded-lg py-1.5 px-3 border border-slate-150 transition-colors"
                    >
                      Document {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveUpdates} className="space-y-4">
              
              {/* Status Selector */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Approval / Payment Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Booking["status"])}
                  className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-gold-500 text-slate-800 cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed (Logistics Set)</option>
                  <option value="Awaiting Payment">Awaiting Payment</option>
                  <option value="Paid">Paid (Confirmed Account)</option>
                  <option value="Completed">Completed Trip</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Guide Selector */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Allocate Guide</label>
                <select
                  value={editGuideId}
                  onChange={(e) => setEditGuideId(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-gold-500 text-slate-800 cursor-pointer"
                >
                  <option value="">No Guide Allocated</option>
                  {guides.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.languages.join(", ")} | Rating: {g.rating})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Selector */}
              <div className="flex flex-col space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Allocate Safari Vehicle</label>
                <select
                  value={editVehicleId}
                  onChange={(e) => setEditVehicleId(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-gold-500 text-slate-800 cursor-pointer"
                >
                  <option value="">No Vehicle Allocated</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.type} - {v.license_plate} (Driver: {v.driver_name} | {v.status})
                    </option>
                  ))}
                </select>
              </div>

              {message && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center space-x-1.5 border ${
                    message.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-500/10"
                      : "bg-red-50 text-red-800 border-red-500/10"
                  }`}
                >
                  <Info className="h-4 w-4 shrink-0" />
                  <span>{message.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold-600 hover:bg-gold-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-xs flex items-center justify-center cursor-pointer"
              >
                {loading ? "Saving Changes..." : "Save Updates & Dispatch Alert"}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
