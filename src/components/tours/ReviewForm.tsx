"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { submitReviewAction } from "@/app/actions";

interface ReviewFormProps {
  tourId: string;
}

export default function ReviewForm({ tourId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!content.trim()) {
      setError("Please write some review comments.");
      setLoading(false);
      return;
    }

    const res = await submitReviewAction({
      tour_id: tourId,
      customer_name: customerName || "Guest Explorer",
      rating,
      content,
    });

    setLoading(false);
    if (!res.success) {
      setError(res.error || "Failed to submit review.");
    } else {
      setSuccess(true);
      setContent("");
      setCustomerName("");
      setRating(5);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-2xl p-6 text-center">
        <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Review Submitted!</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Thank you for sharing your feedback. Your review will be displayed once approved by our moderation team.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 underline decoration-dotted"
        >
          Submit another review
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl space-y-4">
      <h4 className="font-serif font-bold text-slate-800 dark:text-slate-200">Share Your Safari Experience</h4>
      
      {/* Star Selector */}
      <div className="flex items-center space-x-1.5">
        <span className="text-xs text-slate-400 font-medium">Your Rating:</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 text-amber-400 focus:outline-none"
            >
              <Star
                className={`h-5 w-5 shrink-0 ${
                  star <= (hoverRating || rating) ? "fill-amber-400" : "text-slate-350 dark:text-slate-600"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Guest Name (optional, fallback if not logged in) */}
      <div className="flex flex-col space-y-1">
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Your Name (Optional)</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Anonymous Explorer"
          className="w-full bg-white dark:bg-slate-950 border border-slate-250/20 rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
        />
      </div>

      {/* Review Content */}
      <div className="flex flex-col space-y-1">
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Comments</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share details of the guides, vehicles, lodges, sightings..."
          className="w-full bg-white dark:bg-slate-950 border border-slate-250/20 rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-emerald-500 text-slate-805 dark:text-slate-200 h-24 resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors"
      >
        {loading ? "Submitting..." : "Submit Review for Review"}
      </button>
    </form>
  );
}
