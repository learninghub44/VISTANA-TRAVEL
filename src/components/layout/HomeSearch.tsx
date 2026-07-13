"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, DollarSign, Calendar, SlidersHorizontal } from "lucide-react";
import { Destination } from "@/services/db/types";

interface HomeSearchProps {
  destinations: Destination[];
}

export default function HomeSearch({ destinations }: HomeSearchProps) {
  const router = useRouter();
  const [destinationId, setDestinationId] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [duration, setDuration] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destinationId) params.append("destination", destinationId);
    if (category) params.append("category", category);
    if (priceRange) params.append("price", priceRange);
    if (duration) params.append("duration", duration);

    router.push(`/tours?${params.toString()}`);
  };

  const categories = [
    "Safari",
    "Luxury Safari",
    "Budget Safari",
    "Beach Holiday",
    "Family Holiday",
    "Honeymoon",
    "Adventure",
    "Hiking"
  ];

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-5xl mx-auto glassmorphism dark:bg-slate-900/65 rounded-[2.5rem] p-5 sm:p-7 shadow-2xl border border-white/20 dark:border-slate-800/60"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Destination Select */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1 uppercase tracking-widest pl-2">
            <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
            <span>Destination</span>
          </label>
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            className="w-full bg-white/45 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-full text-sm outline-none border border-transparent focus:border-emerald-600/30 transition-all font-medium appearance-none cursor-pointer"
          >
            <option value="" className="bg-white dark:bg-slate-950">Where to?</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id} className="bg-white dark:bg-slate-950">
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Select */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1 uppercase tracking-widest pl-2">
            <SlidersHorizontal className="h-3 w-3 text-emerald-500 shrink-0" />
            <span>Tour Style</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white/45 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-full text-sm outline-none border border-transparent focus:border-emerald-600/30 transition-all font-medium appearance-none cursor-pointer"
          >
            <option value="" className="bg-white dark:bg-slate-950">All Styles</option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-slate-950">
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Price Select */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1 uppercase tracking-widest pl-2">
            <DollarSign className="h-3 w-3 text-emerald-500 shrink-0" />
            <span>Max Budget</span>
          </label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="w-full bg-white/45 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-full text-sm outline-none border border-transparent focus:border-emerald-600/30 transition-all font-medium appearance-none cursor-pointer"
          >
            <option value="" className="bg-white dark:bg-slate-950">No Limit</option>
            <option value="1000" className="bg-white dark:bg-slate-950">Under $1,000</option>
            <option value="2000" className="bg-white dark:bg-slate-950">Under $2,000</option>
            <option value="3000" className="bg-white dark:bg-slate-950">Under $3,000</option>
            <option value="4000" className="bg-white dark:bg-slate-950">Under $4,000</option>
          </select>
        </div>

        {/* Duration Select */}
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1 uppercase tracking-widest pl-2">
            <Calendar className="h-3 w-3 text-emerald-500 shrink-0" />
            <span>Duration</span>
          </label>
          <div className="relative flex items-center">
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-white/45 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200 px-4 py-3 rounded-full text-sm outline-none border border-transparent focus:border-emerald-600/30 transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="" className="bg-white dark:bg-slate-950">Any Duration</option>
              <option value="1-3" className="bg-white dark:bg-slate-950">1 - 3 Days</option>
              <option value="4-7" className="bg-white dark:bg-slate-950">4 - 7 Days</option>
              <option value="8-14" className="bg-white dark:bg-slate-950">8 - 14 Days</option>
            </select>
            
            <button
              type="submit"
              className="absolute right-1.5 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-full hover:shadow-lg transition-all duration-300 flex items-center justify-center shrink-0 border border-emerald-500/20"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
