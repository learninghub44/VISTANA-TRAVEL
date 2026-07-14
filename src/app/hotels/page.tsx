import { cachedDb } from "@/services/db/cached";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HotelCard from "@/components/ui/HotelCard";
import { Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hotels & Resorts",
  description: "Discover handpicked luxury lodges, beach resorts, and boutique hotels across Kenya and Tanzania, curated by Vistana Tours & Travel.",
  alternates: { canonical: "/hotels" },
};

export default async function HotelsPage() {
  const hotels = await cachedDb.getHotels();

  return (
    <>
      <Navbar />

      <section className="bg-slate-900 text-white pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-navy-950/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-3">Stay in Style</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold mb-3">Hotels & Resorts</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light max-w-2xl mx-auto">
            From tented luxury camps overlooking the Mara River to beachfront resorts in Zanzibar, every stay we curate is vetted for comfort, service, and location.
          </p>
        </div>
      </section>

      <section className="py-16 bg-slate-50 dark:bg-[#070a12] min-h-[50vh] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Showing {hotels.length} {hotels.length === 1 ? "property" : "properties"}
            </span>
          </div>

          {hotels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center">
              <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-300">Properties coming soon</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-sm">
                Our team is finalizing partnerships with premium lodges and resorts. In the meantime, reach out and we&apos;ll arrange your stay directly.
              </p>
              <a
                href="/contact"
                className="mt-6 text-xs bg-navy-600 hover:bg-navy-700 text-white font-bold py-2.5 px-6 rounded-full shadow-md transition-all"
              >
                Talk to a Travel Consultant
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
