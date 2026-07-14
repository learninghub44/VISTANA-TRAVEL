import { Star, MapPin, Wifi, ArrowUpRight } from "lucide-react";
import { Hotel } from "@/services/db/types";

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const lowestPrice = hotel.room_types.length > 0
    ? Math.min(...hotel.room_types.map((r) => r.price_usd))
    : null;

  return (
    <div className="group bg-white dark:bg-slate-900/60 rounded-[2rem] border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={hotel.images[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
          alt={hotel.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-navy/90 backdrop-blur-md text-navy dark:text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
          {Array.from({ length: hotel.star_rating }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-gold text-gold" />
          ))}
        </div>
        {lowestPrice !== null && (
          <div className="absolute bottom-4 right-4 bg-navy/85 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
            From ${lowestPrice}/night
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>{hotel.name}</span>
          <ArrowUpRight className="h-4 w-4 text-ocean opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-ocean shrink-0" />
          {hotel.latitude.toFixed(2)}, {hotel.longitude.toFixed(2)}
        </p>

        {hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {hotel.amenities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="text-[10px] bg-ocean/10 text-ocean dark:bg-ocean/15 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"
              >
                <Wifi className="h-2.5 w-2.5" />
                {a}
              </span>
            ))}
          </div>
        )}

        <a
          href={`https://wa.me/254701059192?text=${encodeURIComponent(`Hi Vistana, I'd like to book ${hotel.name}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block text-center text-xs font-bold bg-navy-600 hover:bg-navy-700 text-white py-3 rounded-xl transition-colors"
        >
          Enquire & Book
        </a>
      </div>
    </div>
  );
}
