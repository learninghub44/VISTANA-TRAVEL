import { db } from "@/services/db";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BlogCard from "@/components/ui/BlogCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel Blog",
  description: "Safari guides, travel tips, and stories from Vistana Tours & Travel's journal covering Kenya, Tanzania, and East Africa.",
  alternates: { canonical: "/blog" },
};

export default async function BlogListPage() {
  const blogs = await db.getBlogs();

  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="bg-slate-900 text-white pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-emerald-950/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold mb-3">Vistana Travel Journal</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light max-w-2xl mx-auto">
            Expert safari guides, packing checklists, photography tips, and travel stories direct from East Africa's wild savannahs and tropical coasts.
          </p>
        </div>
      </section>

      {/* Blog List Grid */}
      <section className="py-16 bg-slate-50 dark:bg-[#070a12] min-h-[50vh] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center">
              <h3 className="font-serif text-lg font-bold text-slate-800 dark:text-slate-350">No articles yet</h3>
              <p className="text-xs text-slate-450 mt-1 max-w-sm">
                Our safari experts are currently writing beautiful logs. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
