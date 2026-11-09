"use client";

import { useSyncExternalStore } from "react";

const DESKTOP = "(min-width: 1024px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(DESKTOP), window.matchMedia(REDUCED)];
  queries.forEach((q) => q.addEventListener("change", onChange));
  return () => queries.forEach((q) => q.removeEventListener("change", onChange));
}

function getSnapshot() {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return window.matchMedia(DESKTOP).matches && !window.matchMedia(REDUCED).matches && !conn?.saveData;
}

/**
 * Background video for desktop only. Phones, reduced-motion users and
 * data-saver connections keep the still hero image (no multi-MB download).
 */
export default function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => false);
  if (!enabled) return null;

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover scale-105"
      onError={(e) => ((e.currentTarget as HTMLVideoElement).style.display = "none")}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
