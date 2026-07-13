import { db } from "@/services/db";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DestinationCard from "@/components/ui/DestinationCard";

export default async function DestinationsPage() {
  const destinations = await db.getDestinations();
  const tours = await db.getTours();

  return (
    <>
      <Navbar />
      
      {/* Header */}
      <section className="bg-slate-900 text-white pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-emerald-950/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold mb-3">Explore East Africa</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light max-w-2xl mx-auto">
            From the massive savanna migrations of Maasai Mara and Serengeti to the crystal-clear waters of Diani and Zanzibar. Discover your next dream safari destination.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-slate-50 dark:bg-[#070a12] min-h-[50vh] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinations.map((dest) => {
              const tourCount = tours.filter((t) => t.destination_id === dest.id).length;
              return (
                <DestinationCard
                  key={dest.id}
                  destination={dest}
                  tourCount={tourCount}
                />
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
