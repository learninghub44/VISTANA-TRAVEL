"use client";

import { useState } from "react";
import { cancelBookingAction } from "@/app/actions";
import { Calendar, Users, MapPin, DollarSign, Compass, XCircle, Info, RefreshCw, Star, ShieldAlert } from "lucide-react";
import { Booking, Tour, Guide, Vehicle } from "@/services/db/types";

interface BookingsListProps {
  bookings: Booking[];
  tours: Tour[];
  guides: Guide[];
  vehicles: Vehicle[];
}

export default function BookingsList({ bookings, tours, guides, vehicles }: BookingsListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCancel = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setLoadingId(bookingId);
    setError("");

    const res = await cancelBookingAction(bookingId);
    setLoadingId(null);
    if (!res.success) {
      setError(res.error || "Failed to cancel booking.");
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    const styles: Record<Booking["status"], string> = {
      Pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 border-amber-250/20",
      Confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300 border-blue-250/20",
      "Awaiting Payment": "bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-300 border-purple-250/20",
      Paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-250/20",
      Completed: "bg-slate-100 text-slate-800 dark:bg-slate-800/40 dark:text-slate-350 border-slate-700/20",
      Cancelled: "bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-300 border-red-250/20",
      Refunded: "bg-gray-100 text-gray-800 dark:bg-gray-850 dark:text-gray-300 border-gray-700/20",
    };

    return (
      <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-2xl text-xs flex items-center space-x-1.5 border border-red-500/10">
          <Info className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const tour = tours.find((t) => t.id === booking.tour_id);
            const guide = booking.guide_id ? guides.find((g) => g.id === booking.guide_id) : null;
            const vehicle = booking.vehicle_id ? vehicles.find((v) => v.id === booking.vehicle_id) : null;

            if (!tour) return null;

            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-100 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Details left */}
                <div className="space-y-4 flex-grow max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded">
                      ID: {booking.id}
                    </span>
                    {getStatusBadge(booking.status)}
                    <span className="text-xs text-slate-400 font-medium">
                      Booked on {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {tour.title}
                  </h3>

                  {/* Booking metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Start Date</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-205 mt-0.5 block">{booking.start_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">End Date</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-205 mt-0.5 block">{booking.end_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Travelers</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-205 mt-0.5 block">
                        {booking.adults} Adult{booking.adults > 1 ? "s" : ""}, {booking.children} Child{booking.children !== 1 ? "ren" : ""}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Total Cost</span>
                      <span className="font-bold text-amber-700 dark:text-amber-500 mt-0.5 block">
                        ${booking.total_price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Special requests block */}
                  {booking.special_requests && (
                    <div className="bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-2xl text-[11px] text-slate-500 leading-relaxed border border-slate-200/40 dark:border-slate-800">
                      <strong className="text-slate-650 dark:text-slate-350 block mb-0.5">Special Requests:</strong>
                      "{booking.special_requests}"
                    </div>
                  )}

                  {/* Guide and Vehicle assignments */}
                  {(guide || vehicle) && (
                    <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 p-4 rounded-2xl space-y-2">
                      <h4 className="font-serif font-bold text-xs text-emerald-800 dark:text-emerald-400">Assigned Logistics</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pl-1">
                        {guide && (
                          <div className="flex items-center space-x-3">
                            <img
                              src={guide.image_url}
                              alt={guide.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                            <div>
                              <span className="block font-semibold text-slate-800 dark:text-slate-200">{guide.name} (Guide)</span>
                              <span className="text-[10px] text-slate-400">Rating: {guide.rating.toFixed(1)} | {guide.languages.join(", ")}</span>
                            </div>
                          </div>
                        )}
                        {vehicle && (
                          <div className="flex items-center space-x-2.5">
                            <span className="text-lg">🚐</span>
                            <div>
                              <span className="block font-semibold text-slate-800 dark:text-slate-200">{vehicle.type}</span>
                              <span className="text-[10px] text-slate-400">Plate: {vehicle.license_plate} | Driver: {vehicle.driver_name}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action button right */}
                <div className="shrink-0 flex flex-col items-stretch sm:items-end justify-center md:border-l md:border-slate-100 dark:md:border-slate-800/80 md:pl-6">
                  {booking.status === "Pending" || booking.status === "Confirmed" || booking.status === "Awaiting Payment" ? (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={loadingId === booking.id}
                      className="text-center font-bold text-xs px-4 py-2.5 rounded-full border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 transition-colors shadow-sm cursor-pointer flex items-center justify-center space-x-1"
                    >
                      {loadingId === booking.id ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>Cancel Booking</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-slate-400 text-xs italic font-medium select-none">No actions available</span>
                  )}
                  
                  {booking.status === "Awaiting Payment" && (
                    <div className="mt-3 bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/10 p-3 rounded-xl text-[10px] text-purple-700 dark:text-purple-400 text-center max-w-[170px] space-y-1">
                      <span className="font-bold block text-purple-800 dark:text-purple-300">Awaiting Invoice Payment</span>
                      <span>M-Pesa or Wire details sent to your registered email.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center">
          <Compass className="h-12 w-12 text-slate-350 dark:text-slate-700 mb-4 animate-bounce" />
          <h3 className="font-serif text-lg font-bold text-slate-850 dark:text-slate-300">No bookings yet</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-sm">
            You haven't requested any tour packages yet. Browse our luxury East African routes to get started.
          </p>
          <Link
            href="/tours"
            className="mt-6 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-full shadow-md transition-all"
          >
            Browse Safari Packages
          </Link>
        </div>
      )}
    </div>
  );
}
