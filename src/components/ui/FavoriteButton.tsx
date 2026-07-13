"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavoriteTourAction } from "@/app/actions";

interface FavoriteButtonProps {
  tourId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  className?: string;
}

export default function FavoriteButton({ tourId, initialFavorited, isLoggedIn, className = "" }: FavoriteButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push("/portal/login");
      return;
    }

    // Optimistic update
    setFavorited((prev) => !prev);

    startTransition(async () => {
      const res = await toggleFavoriteTourAction(tourId);
      if (!res.success) {
        // Revert on failure
        setFavorited((prev) => !prev);
        if (res.error) alert(res.error);
      } else if (res.favorited !== undefined) {
        setFavorited(res.favorited);
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={favorited}
      className={`flex items-center justify-center rounded-full backdrop-blur-sm transition-colors cursor-pointer disabled:opacity-60 ${className}`}
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          favorited ? "fill-red-500 stroke-red-500" : "fill-transparent stroke-white"
        }`}
      />
    </button>
  );
}
