"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users, Plane, Building2, Compass as CompassIcon, Car, Package } from "lucide-react";
import { Destination } from "@/services/db/types";

interface HomeSearchProps {
  destinations: Destination[];
}

type TabKey = "hotels" | "flights" | "tours" | "safaris" | "cars" | "packages";

const TABS: { key: TabKey; label: string; icon: typeof Plane; live: boolean }[] = [
  { key: "tours", label: "Tours", icon: CompassIcon, live: true },
  { key: "safaris", label: "Safaris", icon: CompassIcon, live: true },
  { key: "hotels", label: "Hotels", icon: Building2, live: false },
  { key: "flights", label: "Flights", icon: Plane, live: false },
  { key: "cars", label: "Car Rentals", icon: Car, live: false },
  { key: "packages", label: "Holiday Packages", icon: Package, live: false },
];

export default function HomeSearch({ destinations }: HomeSearchProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("tours");
  const [destinationId, setDestinationId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const activeTab = TABS.find((t) => t.key === tab)!;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTab.live) return; // coming-soon tabs have nothing to search yet

    const params = new URLSearchParams();
    if (destinationId) params.append("destination", destinationId);
    if (tab === "safaris") params.append("category", "Safari");
    if (guests) params.append("guests", guests);
    if (checkIn) params.append("from", checkIn);
    if (checkOut) params.append("to", checkOut);

    router.push(`/tours?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                tab === t.key
                  ? "bg-white text-navy shadow-lg"
                  : "bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <form
        onSubmit={handleSearch}
        className="glassmorphism dark:bg-navy/65 rounded-[2rem] p-5 sm:p-7 shadow-2xl border border-white/20 dark:border-slate-800/60"
      >
        {!activeTab.live && (
          <p className="text-xs sm:text-sm text-navy/70 dark:text-slate-300 mb-4 bg-gold/10 border border-gold/30 rounded-2xl px-4 py-2.5">
            {activeTab.label} search is coming soon — in the meantime, our team can arrange this for you directly on{" "}
            <a href="/contact" className="font-semibold text-ocean underline">the contact page</a>.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1 uppercase tracking-widest pl-2">
              <MapPin className="h-3 w-3 text-ocean shrink-0" />
              <span>Destination</span>
            </label>
            <select
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              className="w-full bg-white/60 dark:bg-slate-800/40 text-navy dark:text-slate-200 px-4 py-3 rounded-full text-sm outline-none border border-transparent focus:border-ocean/40 transition-all font-medium appearance-none cursor-pointer"
            >
              <option value="">Where to?</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1 uppercase tracking-widest pl-2">
              <Calendar className="h-3 w-3 text-ocean shrink-0" />
              <span>Check-in</span>
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full bg-white/60 dark:bg-slate-800/40 text-navy dark:text-slate-200 px-4 py-3 rounded-full text-sm outline-none border border-transparent focus:border-ocean/40 transition-all font-medium"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1 uppercase tracking-widest pl-2">
              <Calendar className="h-3 w-3 text-ocean shrink-0" />
              <span>Check-out</span>
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-white/60 dark:bg-slate-800/40 text-navy dark:text-slate-200 px-4 py-3 rounded-full text-sm outline-none border border-transparent focus:border-ocean/40 transition-all font-medium"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1 uppercase tracking-widest pl-2">
              <Users className="h-3 w-3 text-ocean shrink-0" />
              <span>Guests</span>
            </label>
            <div className="relative flex items-center">
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full bg-white/60 dark:bg-slate-800/40 text-navy dark:text-slate-200 px-4 py-3 rounded-full text-sm outline-none border border-transparent focus:border-ocean/40 transition-all font-medium appearance-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="absolute right-1.5 bg-gold hover:brightness-95 text-white p-2.5 rounded-full hover:shadow-lg transition-all duration-300 flex items-center justify-center shrink-0"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
