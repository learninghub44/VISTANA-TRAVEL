"use client";

import { useState } from "react";

interface HeroVideoProps {
  src: string;
  poster: string;
}

/**
 * Background hero video. Some external CDNs (Mixkit, Coverr, etc.) block
 * hotlinked requests by referrer, or an asset can 404 after being taken
 * down/renamed upstream — in either case the previous implementation left
 * a dead/broken <video> sitting on top of the fallback image, which reads
 * to a visitor as a broken page rather than a still hero shot.
 *
 * This wraps the video with onError handling: if the source fails to load
 * for any reason, we simply stop rendering the video element so the
 * background image underneath shows cleanly instead.
 */
export default function HeroVideo({ src, poster }: HeroVideoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      onError={() => setFailed(true)}
      className="absolute inset-0 w-full h-full object-cover scale-105"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
