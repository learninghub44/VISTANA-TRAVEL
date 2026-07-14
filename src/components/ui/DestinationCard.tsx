import Link from "next/link";
import { ArrowUpRight, Navigation } from "lucide-react";
import { Destination } from "@/services/db/types";

interface DestinationCardProps {
  destination: Destination;
  tourCount?: number;
}

export default function DestinationCard({ destination, tourCount = 0 }: DestinationCardProps) {
  return (
    <Link href={`/destinations/${destination.slug}`} className="group relative block aspect-[3/4] rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
      {/* Background Image */}
      <img
        src={destination.images[0] || "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80"}
        alt={destination.name}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        loading="lazy"
      />
      
      {/* Overlay Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-900/10 opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-navy-950/10 transition-colors duration-300" />

      {/* Floating Info */}
      <div className="absolute top-4 right-4 bg-white/10 dark:bg-black/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/15 flex items-center space-x-1">
        <Navigation className="h-3.5 w-3.5 fill-white/10 rotate-45" />
        <span>{tourCount} {tourCount === 1 ? "Tour" : "Tours"}</span>
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end text-white">
        <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide leading-tight group-hover:text-navy-300 transition-colors flex items-center justify-between">
          <span>{destination.name}</span>
          <ArrowUpRight className="h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </h3>
        
        {/* Short Overview snippet */}
        <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-16 transition-all duration-500 overflow-hidden">
          {destination.overview}
        </p>

        {/* Attractions tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {destination.attractions.slice(0, 2).map((att) => (
            <span key={att} className="text-[10px] bg-navy-600/30 text-gold-200 px-2 py-0.5 rounded-md border border-gold-500/20 font-medium">
              {att}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
