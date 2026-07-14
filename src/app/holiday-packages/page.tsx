import { db } from "@/services/db";
import { cachedDb } from "@/services/db/cached";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TourCard from "@/components/ui/TourCard";
import { getSession } from "@/services/auth/session";
import Link from "next/link";
import { Package, Heart, Users, Palmtree } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Holiday Packages",
  description: "All-inclusive beach, honeymoon, and family holiday packages across Kenya, Tanzania, and Zanzibar.",
  alternates: { canonical: "/holiday-packages" },
};

const PACKAGE_CATEGORIES = ["Beach Holiday", "Family Holiday", "Honeymoon"];

const PACKAGE_TYPES = [
  { icon: Palmtree, title: "Beach Holidays", desc: "Zanzibar, Diani, and Mombasa's finest white-sand coastline." },
  { icon: Heart, title: "Honeymoons", desc: "Private villas, candlelit dinners, and sunset dhow cruises." },
  { icon: Users, title: "Family Getaways", desc: "Kid-friendly lodges and gentle game drives the whole family enjoys." },
];

export default async function HolidayPackagesPage() {
  const destinations = await cachedDb.getDestinations();
  const allTours = await cachedDb.getTours();

  const session = await getSession();
  const profile = session ? await db.getProfileById(session.sub) : null;
  const favoriteIds = profile?.favorite_tour_ids || [];

  const packageTours = allTours.filter((t) =>
    PACKAGE_CATEGORIES.some((c) => c.toLowerCase() === t.category.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1920&q=80"
            alt="Zanzibar beach at sunset"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-3">All-Inclusive Escapes</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold mb-4">Holiday Packages</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light max-w-2xl mx-auto leading-relaxed">
            Flights, transfers, stays, and experiences bundled into one seamless itinerary — built for beach escapes, honeymoons, and family holidays alike.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-[#0b0f19] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {PACKAGE_TYPES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-slate-50 dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-ocean/10 flex items-center justify-center mb-5 text-ocean">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-[#070a12] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Featured Packages
            </h2>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">
              {packageTours.length} {packageTours.length === 1 ? "package" : "packages"}
            </span>
          </div>

          {packageTours.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {packageTours.map((tour) => {
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
              <Package className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-300">No packages published yet</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-sm">
                Tell us your dream destination and travel dates — our team will build a custom package around it.
              </p>
              <Link
                href="/contact"
                className="mt-6 text-xs bg-navy-600 hover:bg-navy-700 text-white font-bold py-2.5 px-6 rounded-full shadow-md transition-all"
              >
                Plan My Trip
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
