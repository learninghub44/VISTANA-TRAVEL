import { db } from "@/services/db";
import { cachedDb } from "@/services/db/cached";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TourCard from "@/components/ui/TourCard";
import { notFound } from "next/navigation";
import { Compass, CloudSun, MapPin, Compass as CompassIcon, Info, HelpCircle } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const destination = await cachedDb.getDestinationBySlug(params.slug);
  if (!destination) return {};

  const description = destination.overview.length > 155 ? `${destination.overview.slice(0, 152)}...` : destination.overview;
  const image = destination.images[0];

  return {
    title: destination.name,
    description,
    alternates: { canonical: `/destinations/${destination.slug}` },
    openGraph: {
      title: destination.name,
      description,
      url: `/destinations/${destination.slug}`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: destination.name }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: destination.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function DestinationDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const destination = await cachedDb.getDestinationBySlug(params.slug);

  if (!destination) {
    notFound();
  }

  const allTours = await cachedDb.getTours();
  const matchingTours = allTours.filter((t) => t.destination_id === destination.id);

  return (
    <>
      <Navbar />

      {/* Banner */}
      <section className="relative h-[55vh] bg-slate-950 flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            src={destination.images[0]}
            alt={destination.name}
            className="w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-white w-full">
          <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            Destination Spotlight
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight mb-2 leading-tight">
            {destination.name}
          </h1>
          <p className="flex items-center space-x-1 text-xs text-slate-350 font-medium">
            <MapPin className="h-4 w-4 text-emerald-450 shrink-0" />
            <span>Latitude: {destination.latitude.toFixed(4)}, Longitude: {destination.longitude.toFixed(4)}</span>
          </p>
        </div>
      </section>

      {/* Overview & Grid */}
      <section className="py-16 bg-slate-50 dark:bg-[#070a12] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content column */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Overview */}
              <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">About the Destination</h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                  {destination.overview}
                </p>
              </div>

              {/* Grid of Attractions and Activities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Attractions */}
                <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                  <h3 className="font-serif font-bold text-lg text-emerald-850 dark:text-emerald-400 mb-4 flex items-center space-x-2">
                    <CompassIcon className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>Top Attractions</span>
                  </h3>
                  <ul className="space-y-3.5 text-xs text-slate-650 dark:text-slate-305">
                    {destination.attractions.map((att) => (
                      <li key={att} className="flex items-start space-x-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span>{att}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Activities */}
                <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                  <h3 className="font-serif font-bold text-lg text-emerald-850 dark:text-emerald-400 mb-4 flex items-center space-x-2">
                    <Compass className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>Popular Activities</span>
                  </h3>
                  <ul className="space-y-3.5 text-xs text-slate-650 dark:text-slate-305">
                    {destination.activities.map((act) => (
                      <li key={act} className="flex items-start space-x-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Matching tours */}
              <div className="space-y-6">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">Tour Packages to {destination.name}</h3>
                
                {matchingTours.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {matchingTours.map((tour) => (
                      <TourCard
                        key={tour.id}
                        tour={tour}
                        destinationName={destination.name}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 p-6 text-xs">
                    No packages registered under this destination yet. Check back soon!
                  </div>
                )}
              </div>

            </div>

            {/* Right sidebar info */}
            <div className="space-y-6">
              
              {/* Weather Info */}
              <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm text-slate-800 dark:text-slate-200">
                <h3 className="font-serif font-bold text-base mb-4 flex items-center space-x-2">
                  <CloudSun className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>Climate & Weather</span>
                </h3>
                <p className="text-xs text-slate-555 dark:text-slate-400 leading-relaxed font-light">
                  {destination.weather}
                </p>
              </div>

              {/* Travel Tips */}
              <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm text-slate-800 dark:text-slate-200 space-y-4">
                <h3 className="font-serif font-bold text-base flex items-center space-x-2">
                  <Info className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>Travel Information</span>
                </h3>
                
                <div className="space-y-4 text-xs">
                  {destination.travel_tips.map((tip, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="font-bold text-slate-900 dark:text-slate-150 block">{tip.title}</span>
                      <p className="text-slate-550 dark:text-slate-400 leading-relaxed font-light">{tip.content}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
