import { db } from "@/services/db";
import SocialFeedManager from "@/components/admin/SocialFeedManager";

export const dynamic = "force-dynamic";

export default async function AdminSocialFeedPage() {
  const posts = await db.getSocialPosts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Social Feed</h1>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
          Curate the posts shown in the homepage social feed. There is no live
          Instagram/Facebook API integration — add posts manually and link
          back to the real post.
        </p>
      </div>
      <SocialFeedManager posts={posts} />
    </div>
  );
}
