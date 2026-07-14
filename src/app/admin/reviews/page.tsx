import { db } from "@/services/db";
import ReviewsManager from "@/components/admin/ReviewsManager";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await db.getReviews();
  const tours = await db.getTours();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Review Moderation</h1>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
          Approve, reject, or remove guest-submitted tour reviews.
        </p>
      </div>
      <ReviewsManager reviews={reviews} tours={tours} />
    </div>
  );
}
