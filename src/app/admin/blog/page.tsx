import { db } from "@/services/db";
import BlogManager from "@/components/admin/BlogManager";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const blogs = await db.getBlogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900">Blog Management</h1>
        <p className="text-xs text-slate-450 mt-1">
          Create, edit, and delete posts on the Vistana Journal.
        </p>
      </div>
      <BlogManager blogs={blogs} />
    </div>
  );
}
