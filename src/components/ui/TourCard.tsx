import Link from "next/link";
import { Clock, Tag, MapPin, Star } from "lucide-react";
import { Tour } from "@/services/db/types";
import FavoriteButton from "@/components/ui/FavoriteButton";

interface TourCardProps {
  tour: Tour;
  destinationName: string;
  rating?: number;
  reviewCount?: number;
  isFavorited?: boolean;
  isLoggedIn?: boolean;
}

export default function TourCard({ tour, destinationName, rating = 4.8, reviewCount = 12, isFavorited = false, isLoggedIn = false }: TourCardProps) {
  return (
    <div className="group relative bg-white dark:bg-slate-900/60 rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl hover:shadow-navy-950/10 hover:-translate-y-2 transition-all duration-500 ease-out border border-slate-100 dark:border-slate-800/80 flex flex-col h-full">
      {/* Tour Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
        <img
          src={tour.images[0] || "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80"}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        {/* Gradients and Tags */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        {/* Category Tag */}
        <span className="absolute top-4 left-4 bg-navy-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-md">
          {tour.category}
        </span>

        {/* Difficulty Badge */}
        <span className="absolute top-4 right-4 bg-slate-900/70 text-slate-100 text-[10px] font-medium px-2 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-sm border border-slate-700">
          {tour.difficulty}
        </span>

        {/* Favorite Button */}
        <FavoriteButton
          tourId={tour.id}
          initialFavorited={isFavorited}
          isLoggedIn={isLoggedIn}
          className="absolute bottom-4 right-4 h-9 w-9 bg-slate-900/60 hover:bg-slate-900/80 border border-white/10"
        />
      </div>

      {/* Tour Body */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          {/* Destination and Rating */}
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <span className="flex items-center space-x-1 font-medium">
              <MapPin className="h-3.5 w-3.5 text-navy-500 shrink-0" />
              <span className="truncate max-w-[150px]">{destinationName}</span>
            </span>
            <span className="flex items-center space-x-1 bg-gold-500/10 text-gold-700 dark:text-gold-400 px-2 py-0.5 rounded-full font-semibold">
              <Star className="h-3 w-3 fill-gold-500 stroke-gold-500 shrink-0" />
              <span>{rating.toFixed(1)} ({reviewCount})</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-navy-600 dark:group-hover:text-navy-400 transition-colors mb-3">
            <Link href={`/tours/${tour.slug}`}>
              {tour.title}
            </Link>
          </h3>
          
          {/* Description */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
            {tour.description}
          </p>
        </div>

        {/* Pricing and Action */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">From</span>
            <span className="text-lg font-extrabold text-gold-700 dark:text-gold-500 font-sans">${tour.price_usd.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-medium"> / person</span>
          </div>
          <Link
            href={`/tours/${tour.slug}`}
            className="flex items-center space-x-1.5 bg-navy-600 hover:bg-navy-700 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-md hover:shadow-lg hover:shadow-gold-500/20 hover:px-5 transition-all duration-300"
          >
            <span>Details</span>
            <Clock className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
