"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Images } from "lucide-react";
import SmartImage from "@/components/ui/SmartImage";

/**
 * Desktop: a 1 large + 4 small "bento" grid. Mobile: a swipeable strip.
 * Any photo opens a full-screen lightbox (arrow keys, Esc, click outside).
 */
export default function TourGallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const list = images.filter(Boolean);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + list.length) % list.length)),
    [list.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  if (list.length < 2) return null;
  const grid = list.slice(0, 5);

  return (
    <>
      {/* Desktop bento */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[440px] lg:h-[560px] 2xl:h-[680px] rounded-2xl overflow-hidden">
        {grid.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${list.length}`}
            className={`relative overflow-hidden group focus:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 ${
              i === 0 ? "col-span-2 row-span-2" : ""
            }`}
          >
            <SmartImage
              src={src}
              alt={`${title} — photo ${i + 1}`}
              sizes={i === 0 ? "(min-width: 1024px) 50vw, 60vw" : "25vw"}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-colors" />
            {i === grid.length - 1 && list.length > grid.length && (
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow">
                <Images className="h-3.5 w-3.5" /> +{list.length - grid.length} more
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile strip */}
      <div className="md:hidden -mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
        {list.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${list.length}`}
            className="relative shrink-0 snap-start w-[78%] aspect-[4/3] rounded-2xl overflow-hidden"
          >
            <SmartImage src={src} alt={`${title} — photo ${i + 1}`} sizes="80vw" className="absolute inset-0 w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo gallery`}
          className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          <button type="button" onClick={close} aria-label="Close gallery" className="absolute top-4 right-4 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            aria-label="Previous photo"
            className="absolute left-3 md:left-8 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="relative w-full max-w-6xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <SmartImage src={list[open]} alt={`${title} — photo ${open + 1}`} priority sizes="100vw" className="w-full h-full object-contain" />
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); step(1); }}
            aria-label="Next photo"
            className="absolute right-3 md:right-8 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/70 font-medium">
            {open + 1} / {list.length}
          </span>
        </div>
      )}
    </>
  );
}
