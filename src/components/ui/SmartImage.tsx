"use client";

import { useCallback, useState } from "react";
import { Compass } from "lucide-react";
import { buildSrcSet } from "@/lib/images";

interface SmartImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  /** Above-the-fold images: load immediately and at high priority. */
  priority?: boolean;
  /** Tells the browser how wide the image displays, so it picks the right srcset file. */
  sizes?: string;
  width?: number;
  height?: number;
}

/**
 * Drop-in <img> that never shows a broken-image icon:
 *  - shimmer placeholder while loading, then a soft fade-in
 *  - lazy + async decoding (eager/high priority when `priority`)
 *  - responsive srcset where the host supports it
 *  - a branded fallback panel if the URL is missing or fails to load
 *    (e.g. a file that was deleted, or a URL from a removed storage project)
 */
export default function SmartImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "100vw",
  width,
  height,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!src);

  // The image may already have finished (or failed) before React hydrated, in
  // which case onLoad/onError never fire — check it as soon as it attaches.
  const attach = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete) {
      if (el.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, []);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className} flex items-center justify-center bg-gradient-to-br from-navy-800 via-navy-700 to-slate-900 text-white/40`}
      >
        <Compass className="h-10 w-10" aria-hidden="true" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- plain <img> on purpose (see lib/images.ts)
    <img
      ref={attach}
      src={src}
      srcSet={buildSrcSet(src)}
      sizes={buildSrcSet(src) ? sizes : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      referrerPolicy="no-referrer"
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={`${className} transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"} ${
        loaded ? "" : "animate-pulse bg-slate-200 dark:bg-slate-800"
      }`}
    />
  );
}
