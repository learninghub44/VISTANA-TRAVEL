import { db } from "@/services/db";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { notFound } from "next/navigation";
import { Calendar, User, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const blog = await db.getBlogBySlug(params.slug);
  if (!blog) return {};

  const plainText = blog.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const description = plainText.length > 155 ? `${plainText.slice(0, 152)}...` : plainText;

  return {
    title: blog.title,
    description,
    alternates: { canonical: `/blog/${blog.slug}` },
    openGraph: {
      title: blog.title,
      description,
      url: `/blog/${blog.slug}`,
      images: blog.image_url ? [{ url: blog.image_url, width: 1200, height: 630, alt: blog.title }] : undefined,
      type: "article",
      publishedTime: blog.created_at,
      authors: [blog.author],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
      images: blog.image_url ? [blog.image_url] : undefined,
    },
  };
}

export default async function BlogDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const blog = await db.getBlogBySlug(params.slug);

  if (!blog) {
    notFound();
  }

  const formattedDate = new Date(blog.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    image: blog.image_url ? [blog.image_url] : undefined,
    datePublished: blog.created_at,
    author: { "@type": "Person", name: blog.author },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Navbar />

      <article className="bg-slate-50 dark:bg-[#070a12] min-h-screen pt-32 pb-24 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back button */}
          <Link
            href="/blog"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-705 transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Journal</span>
          </Link>

          {/* Heading */}
          <header className="space-y-4 mb-8">
            <span className="bg-emerald-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-block">
              {blog.category}
            </span>
            
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
              <span className="flex items-center space-x-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <User className="h-4 w-4" />
                <span>By {blog.author}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Clock className="h-4 w-4" />
                <span>5 Min Read</span>
              </span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-md mb-10 bg-slate-200">
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Rich Content body */}
          <div className="bg-white dark:bg-slate-900/40 p-6 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
            <div className="prose dark:prose-invert max-w-none text-slate-650 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-light space-y-6">
              {blog.content.split("\n\n").map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>

        </div>
      </article>

      <Footer />
    </>
  );
}
