import { db } from "@/services/db";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TourCard from "@/components/ui/TourCard";
import Link from "next/link";
import { Compass, Filter, RefreshCw } from "lucide-react";
import { getSession } from "@/services/auth/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tour Packages",
  description: "Browse our curated collection of luxury safaris, beach getaways, and adventure tours across Kenya and Tanzania.",
  alternates: { canonical: "/tours" },
};

interface SearchParams {
  destination?: string;
  category?: string;
  price?: string;
  duration?: string;
}

export default async function ToursPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const destinations = await db.getDestinations();
  const allTours = await db.getTours();

  const session = await getSession();
  const profile = session ? await db.getProfileById(session.sub) : null;
  const favoriteIds = profile?.favorite_tour_ids || [];

  // Extract query filters
  const fDest = searchParams.destination || "";
  const fCat = searchParams.category || "";
  const fPrice = searchParams.price ? parseInt(searchParams.price) : 0;
  const fDur = searchParams.duration || "";

  // Apply filters
  const filteredTours = allTours.filter((tour) => {
    if (fDest && tour.destination_id !== fDest) return false;
    if (fCat && tour.category.toLowerCase() !== fCat.toLowerCase()) return false;
    if (fPrice && tour.price_usd > fPrice) return false;
    
    if (fDur) {
      const days = tour.duration_days;
      if (fDur === "1-3" && (days < 1 || days > 3)) return false;
      if (fDur === "4-7" && (days < 4 || days > 7)) return false;
      if (fDur === "8-14" && (days < 8 || days > 14)) return false;
    }
    return true;
  });

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
    <>
      <Navbar />
      
      {/* Small Header */}
      <section className="bg-slate-900 text-white pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-emerald-950/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold mb-3">Our Tour Packages</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light max-w-2xl mx-auto">
            Choose from our curated collection of luxury safaris, beach getaways, and extreme high-altitude climbs designed to fit your taste.
          </p>
        </div>
      </section>

      {/* Main content grid */}
      <section className="py-16 bg-slate-50 dark:bg-[#070a12] min-h-[60vh] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Filter sidebar (Server Side Navigation) */}
            <aside className="lg:sticky lg:top-24 bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <span className="font-bold flex items-center space-x-2 text-slate-800 dark:text-slate-200">
                  <Filter className="h-4 w-4 text-emerald-500" />
                  <span>Filters</span>
                </span>
                {(fDest || fCat || fPrice || fDur) && (
                  <Link
                    href="/tours"
                    className="text-xs text-red-500 hover:text-red-600 flex items-center space-x-1 font-semibold"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Clear All</span>
                  </Link>
                )}
              </div>

              {/* Destination Filter */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Destination</h3>
                <div className="space-y-2">
                  <Link
                    href={`/tours?${new URLSearchParams({ ...searchParams, destination: "" }).toString()}`}
                    className={`block text-xs py-1.5 px-3 rounded-lg transition-colors ${
                      !fDest
                        ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/20 dark:text-emerald-300"
                        : "text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                    }`}
                  >
                    All Destinations
                  </Link>
                  {destinations.map((d) => (
                    <Link
                      key={d.id}
                      href={`/tours?${new URLSearchParams({ ...searchParams, destination: d.id }).toString()}`}
                      className={`block text-xs py-1.5 px-3 rounded-lg transition-colors ${
                        fDest === d.id
                          ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/20 dark:text-emerald-300"
                          : "text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                      }`}
                    >
                      {d.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Tour Style</h3>
                <div className="space-y-2">
                  <Link
                    href={`/tours?${new URLSearchParams({ ...searchParams, category: "" }).toString()}`}
                    className={`block text-xs py-1.5 px-3 rounded-lg transition-colors ${
                      !fCat
                        ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/20 dark:text-emerald-300"
                        : "text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                    }`}
                  >
                    All Styles
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c}
                      href={`/tours?${new URLSearchParams({ ...searchParams, category: c }).toString()}`}
                      className={`block text-xs py-1.5 px-3 rounded-lg transition-colors ${
                        fCat.toLowerCase() === c.toLowerCase()
                          ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/20 dark:text-emerald-300"
                          : "text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                      }`}
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Max Budget</h3>
                <div className="space-y-2">
                  {[
                    { label: "No Limit", value: "" },
                    { label: "Under $1,000", value: "1000" },
                    { label: "Under $2,000", value: "2000" },
                    { label: "Under $3,000", value: "3000" },
                    { label: "Under $4,000", value: "4000" },
                  ].map((p) => (
                    <Link
                      key={p.label}
                      href={`/tours?${new URLSearchParams({ ...searchParams, price: p.value }).toString()}`}
                      className={`block text-xs py-1.5 px-3 rounded-lg transition-colors ${
                        (p.value === "" && !fPrice) || (fPrice.toString() === p.value)
                          ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/20 dark:text-emerald-300"
                          : "text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                      }`}
                    >
                      {p.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Duration</h3>
                <div className="space-y-2">
                  {[
                    { label: "Any Duration", value: "" },
                    { label: "1 - 3 Days", value: "1-3" },
                    { label: "4 - 7 Days", value: "4-7" },
                    { label: "8 - 14 Days", value: "8-14" },
                  ].map((d) => (
                    <Link
                      key={d.label}
                      href={`/tours?${new URLSearchParams({ ...searchParams, duration: d.value }).toString()}`}
                      className={`block text-xs py-1.5 px-3 rounded-lg transition-colors ${
                        fDur === d.value
                          ? "bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/20 dark:text-emerald-300"
                          : "text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                      }`}
                    >
                      {d.label}
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            {/* Tours Grid */}
            <main className="lg:col-span-3">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-2">
                  Showing {filteredTours.length} {filteredTours.length === 1 ? "tour package" : "tour packages"}
                </span>
              </div>

              {filteredTours.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {filteredTours.map((tour) => {
                    const dest = destinations.find((d) => d.id === tour.destination_id);
                    return (
                      <TourCard
                        key={tour.id}
                        tour={tour}
                        destinationName={dest ? dest.name : "East Africa"}
                        isFavorited={favoriteIds.includes(tour.id)}
                        isLoggedIn={!!session}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center">
                  <Compass className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4 animate-spin" />
                  <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-300">No tours available yet</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-sm">
                    No packages match your current filters. Try resetting the options or adjusting your maximum budget.
                  </p>
                  <Link
                    href="/tours"
                    className="mt-6 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-full shadow-md transition-all"
                  >
                    Reset Filters
                  </Link>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
