"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBookingAction } from "@/app/actions";
import { Calendar, Users, Info, Sparkles } from "lucide-react";
import { Tour } from "@/services/db/types";

interface BookingFormProps {
  tour: Tour;
}

export default function BookingForm({ tour }: BookingFormProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Pricing calculations
  const pricePerAdult = tour.price_usd;
  const pricePerChild = tour.price_usd * 0.5;
  const total = adults * pricePerAdult + children * pricePerChild;

  // Set default end date (start date + duration days)
  const getEndDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    date.setDate(date.getDate() + tour.duration_days);
    return date.toISOString().split("T")[0];
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!startDate) {
      setError("Please select a travel start date.");
      setLoading(false);
      return;
    }

    const endDate = getEndDate(startDate);

    const res = await createBookingAction({
      tourId: tour.id,
      startDate,
      endDate,
      adults,
      children,
      specialRequests
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to submit booking.");
      if (res.error?.includes("log in")) {
        // Redirect to login after brief delay
        setTimeout(() => router.push("/portal/login"), 2000);
      }
    } else {
      setSuccess(true);
      // Refresh page and redirect to portal after a delay
      setTimeout(() => {
        router.push("/portal");
        router.refresh();
      }, 3000);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-8 text-center text-slate-800 dark:text-slate-200 shadow-lg">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="h-8 w-8 animate-pulse" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">Request Submitted!</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
          Thank you for choosing Vistana. Your booking request for <strong>{tour.title}</strong> is pending confirmation. An email details sheet has been dispatched.
        </p>
        <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold animate-pulse">
          Redirecting to your portal...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-md">
      <h3 className="font-serif text-xl font-bold text-slate-950 dark:text-white mb-6">Book This Package</h3>

      <form onSubmit={handleBooking} className="space-y-5">
        {/* Date Selector */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Travel Start Date</label>
          <div className="relative">
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-850 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-200 cursor-pointer"
            />
          </div>
        </div>

        {/* Travelers Count */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Adults</label>
            <select
              value={adults}
              onChange={(e) => setAdults(parseInt(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-850 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-emerald-500 text-slate-850 dark:text-slate-200 cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num} Adult{num > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Children (50% Off)</label>
            <select
              value={children}
              onChange={(e) => setChildren(parseInt(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-850 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-emerald-500 text-slate-850 dark:text-slate-200 cursor-pointer"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} Child{num !== 1 ? "ren" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Special Requests */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Special Requests</label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Dietary requests, guides preference, extra transfer luggage..."
            className="w-full bg-slate-50 dark:bg-slate-850 border-none rounded-xl py-3 px-4 text-sm outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200 resize-none h-20"
          />
        </div>

        {/* Summary pricing list */}
        <div className="bg-slate-50 dark:bg-slate-800/35 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Adults ({adults} × ${pricePerAdult})</span>
            <span className="font-bold">${(adults * pricePerAdult).toLocaleString()}</span>
          </div>
          {children > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">Children ({children} × ${pricePerChild})</span>
              <span className="font-bold">${(children * pricePerChild).toLocaleString()}</span>
            </div>
          )}
          <hr className="border-slate-200/50 dark:border-slate-800" />
          <div className="flex justify-between text-sm pt-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">Total Price</span>
            <span className="font-extrabold text-amber-700 dark:text-amber-500">${total.toLocaleString()}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center space-x-1.5 border border-red-500/10">
            <Info className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center"
        >
          {loading ? "Processing..." : "Submit Booking Request"}
        </button>

        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          No charges are made yet. An administrator will verify accommodation availability and get back to you with guide/vehicle allocation.
        </p>
      </form>
    </div>
  );
}
