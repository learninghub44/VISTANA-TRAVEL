import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Blog } from "@/services/db/types";

interface BlogCardProps {
  blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
  const formattedDate = new Date(blog.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="group bg-white dark:bg-slate-900/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 flex flex-col h-full">
      {/* Blog Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 shrink-0">
        <img
          src={blog.image_url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Category Tag */}
        <span className="absolute top-4 left-4 bg-emerald-600/90 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-md">
          {blog.category}
        </span>
      </div>

      {/* Blog Details */}
      <div className="p-5 flex flex-col justify-between flex-grow">
        <div>
          {/* Metadata */}
          <div className="flex items-center space-x-4 text-[11px] text-slate-400 mb-3 font-medium">
            <span className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center space-x-1">
              <User className="h-3.5 w-3.5" />
              <span className="truncate max-w-[100px]">{blog.author}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-3">
            <Link href={`/blog/${blog.slug}`}>
              {blog.title}
            </Link>
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
            {blog.content}
          </p>
        </div>

        {/* Read More Link */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link
            href={`/blog/${blog.slug}`}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors group/btn"
          >
            <span>Read Article</span>
            <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
