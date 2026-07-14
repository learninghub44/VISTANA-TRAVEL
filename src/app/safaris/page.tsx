import { db } from "@/services/db";
import { cachedDb } from "@/services/db/cached";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TourCard from "@/components/ui/TourCard";
import DestinationCard from "@/components/ui/DestinationCard";
import { getSession } from "@/services/auth/session";
import Link from "next/link";
import { Compass, ShieldCheck, Binoculars, Tent } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luxury Safaris",
  description: "Handcrafted luxury, wildlife, and budget safaris across the Maasai Mara, Serengeti, and East Africa's most iconic reserves.",
  alternates: { canonical: "/safaris" },
};

const SAFARI_CATEGORIES = ["Safari", "Luxury Safari", "Budget Safari", "Wildlife"];

export default async function SafarisPage() {
  const destinations = await cachedDb.getDestinations();
  const allTours = await cachedDb.getTours();

  const session = await getSession();
  const profile = session ? await db.getProfileById(session.sub) : null;
  const favoriteIds = profile?.favorite_tour_ids || [];

  const safariTours = allTours.filter((t) =>
    SAFARI_CATEGORIES.some((c) => c.toLowerCase() === t.category.toLowerCase())
  );

  const safariDestinations = destinations.slice(0, 4);

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1920&q=80"
            alt="Lions resting in the Maasai Mara"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-3">The Great Migration Awaits</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold mb-4">Luxury Safari Experiences</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light max-w-2xl mx-auto leading-relaxed">
            Track the Big Five across the Maasai Mara and Serengeti, sleep under canvas in award-winning tented camps, and let expert guides bring the wilderness to life.
          </p>
        </div>
      </section>

      {/* Why safari with us */}
      <section className="py-16 bg-white dark:bg-[#0b0f19] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Binoculars, title: "Expert Guides", desc: "Career naturalists who know every trail, herd, and season." },
            { icon: Tent, title: "Handpicked Camps", desc: "Only lodges and tented camps that meet our comfort and ethics standards." },
            { icon: ShieldCheck, title: "Fully Insured Travel", desc: "Vehicle, medical, and emergency evacuation cover on every itinerary." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-slate-50 dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-5 text-gold">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Safari destinations */}
      <section className="py-16 bg-slate-50 dark:bg-[#070a12] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-8">
            Top Safari Destinations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {safariDestinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} tourCount={allTours.filter((t) => t.destination_id === dest.id).length} />
            ))}
          </div>
        </div>
      </section>

      {/* Safari packages */}
      <section className="py-16 bg-white dark:bg-[#0b0f19] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Safari Packages
            </h2>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">
              {safariTours.length} {safariTours.length === 1 ? "package" : "packages"}
            </span>
          </div>

          {safariTours.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {safariTours.map((tour) => {
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
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center">
              <Compass className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-300">No safari packages yet</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-sm">
                Browse our full tour catalog or talk to our safari designers for a fully bespoke itinerary.
              </p>
              <Link
                href="/tours"
                className="mt-6 text-xs bg-navy-600 hover:bg-navy-700 text-white font-bold py-2.5 px-6 rounded-full shadow-md transition-all"
              >
                Browse All Tours
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
