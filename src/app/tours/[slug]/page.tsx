import { db } from "@/services/db";
import { cachedDb } from "@/services/db/cached";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingForm from "@/components/tours/BookingForm";
import ReviewForm from "@/components/tours/ReviewForm";
import { notFound } from "next/navigation";
import { Clock, MapPin, Star, Shield, HelpCircle, Check, X, User, BookOpen } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/services/auth/session";
import FavoriteButton from "@/components/ui/FavoriteButton";
import BlogCard from "@/components/ui/BlogCard";
import type { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const tour = await cachedDb.getTourBySlug(params.slug);
  if (!tour) return {};

  const description = tour.description.length > 155 ? `${tour.description.slice(0, 152)}...` : tour.description;
  const image = tour.images[0];

  return {
    title: tour.title,
    description,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      title: tour.title,
      description,
      url: `/tours/${tour.slug}`,
      images: image ? [{ url: image, width: 1200, height: 630, alt: tour.title }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: tour.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function TourDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const tour = await cachedDb.getTourBySlug(params.slug);

  if (!tour) {
    notFound();
  }

  const destination = (await cachedDb.getDestinations()).find((d) => d.id === tour.destination_id);
  const guides = await cachedDb.getGuides();
  const guide = tour.guide_id ? guides.find((g) => g.id === tour.guide_id) : null;
  const approvedReviews = await cachedDb.getApprovedReviews(tour.id);
  const blogs = await cachedDb.getBlogs();
  const latestBlogs = blogs.slice(0, 3);

  const session = await getSession();
  const profile = session ? await db.getProfileById(session.sub) : null;
  const isFavorited = !!profile?.favorite_tour_ids?.includes(tour.id);

  // Calculate average rating
  const avgRating = approvedReviews.length > 0
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
    : 4.8; // default fallback

  const tourJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tour.title,
    description: tour.description,
    image: tour.images,
    touristType: tour.category,
    itinerary: tour.itinerary.map((day) => ({
      "@type": "TouristAttraction",
      name: day.title,
      description: day.description,
    })),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: tour.price_usd,
      availability: "https://schema.org/InStock",
    },
    ...(approvedReviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: approvedReviews.length,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tourJsonLd) }}
      />
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[60vh] bg-slate-950 flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            src={tour.images[0]}
            alt={tour.title}
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-white w-full">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="bg-navy-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                {tour.category}
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight max-w-4xl mb-4 leading-tight">
                {tour.title}
              </h1>
            </div>
            <FavoriteButton
              tourId={tour.id}
              initialFavorited={isFavorited}
              isLoggedIn={!!session}
              className="h-11 w-11 bg-slate-900/60 hover:bg-slate-900/80 border border-white/10 shrink-0 mt-1"
            />
          </div>

          <div className="flex flex-wrap gap-y-2 gap-x-6 items-center text-xs text-slate-300">
            <span className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-navy-400" />
              <span>{destination ? destination.name : "East Africa"}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-navy-400" />
              <span>{tour.duration_days} Days</span>
            </span>
            <span className="flex items-center space-x-1 bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
              <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
              <span>{avgRating.toFixed(1)} ({approvedReviews.length} Reviews)</span>
            </span>
          </div>
        </div>
      </section>

      {/* Detail Core Grid */}
      <section className="py-16 bg-slate-50 dark:bg-[#070a12] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Left Content Column */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Tour Overview */}
              <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-4">
                <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Adventure Overview</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light">
                  {tour.description}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Difficulty</span>
                    <span className="font-bold text-slate-850 dark:text-slate-200 text-sm mt-0.5 block">{tour.difficulty}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Max Guests</span>
                    <span className="font-bold text-slate-850 dark:text-slate-200 text-sm mt-0.5 block">{tour.max_guests} Guests</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Min Age</span>
                    <span className="font-bold text-slate-850 dark:text-slate-200 text-sm mt-0.5 block">5 Years</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Languages</span>
                    <span className="font-bold text-slate-850 dark:text-slate-200 text-sm mt-0.5 block">{tour.languages.join(", ")}</span>
                  </div>
                </div>
              </div>

              {/* Itinerary Section */}
              <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-6">
                <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Day-by-Day Itinerary</h2>
                <div className="space-y-4">
                  {tour.itinerary.map((day) => (
                    <details
                      key={day.day}
                      className="group border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer bg-slate-50/40 dark:bg-slate-950/20"
                    >
                      <summary className="flex justify-between items-center focus:outline-none list-none">
                        <div className="flex items-center space-x-3.5">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-navy-500/10 text-navy-600 dark:text-navy-400 font-bold text-xs flex items-center justify-center">
                            {day.day}
                          </span>
                          <span className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {day.title}
                          </span>
                        </div>
                        <span className="text-xs text-navy-600 dark:text-navy-400 font-semibold group-open:hidden">Expand</span>
                        <span className="text-xs text-slate-400 font-semibold hidden group-open:inline">Collapse</span>
                      </summary>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed pl-11">
                        {day.description}
                      </p>
                    </details>
                  ))}
                </div>
              </div>

              {/* Included / Excluded services */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Inclusions */}
                <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                  <h3 className="font-serif font-bold text-lg mb-4 text-navy-700 dark:text-navy-400">What's Included</h3>
                  <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-300">
                    {tour.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-navy-500 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Exclusions */}
                <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                  <h3 className="font-serif font-bold text-lg mb-4 text-red-700 dark:text-red-400">What's Excluded</h3>
                  <ul className="space-y-2.5 text-xs text-slate-650 dark:text-slate-300">
                    {tour.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Guide Info Card */}
              {guide && (
                <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
                  <img
                    src={guide.image_url}
                    alt={guide.name}
                    className="w-16 h-16 rounded-full object-cover shrink-0 border border-navy-500/20"
                  />
                  <div className="text-center sm:text-left flex-grow">
                    <span className="text-[10px] text-navy-600 dark:text-navy-400 uppercase tracking-widest font-semibold">Your Safari Naturalist Guide</span>
                    <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white mt-0.5">{guide.name}</h3>
                    <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">
                      Speaks: {guide.languages.join(", ")} | {guide.experience_years} Years Experience
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center space-x-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-500 stroke-amber-500" />
                    <span>{guide.rating.toFixed(1)} Guide Rating</span>
                  </div>
                </div>
              )}

              {/* FAQs Accordion */}
              <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-6">
                <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {tour.faqs.map((faq, idx) => (
                    <details
                      key={idx}
                      className="group border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer"
                    >
                      <summary className="flex justify-between items-center focus:outline-none list-none">
                        <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                          <HelpCircle className="h-4 w-4 text-navy-500 shrink-0" />
                          <span>{faq.question}</span>
                        </span>
                        <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform font-bold">&#9662;</span>
                      </summary>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed pl-6">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>

              {/* Reviews List & Write Review */}
              <div className="space-y-6">
                <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Guest Reviews</h2>
                
                {approvedReviews.length > 0 ? (
                  <div className="space-y-4">
                    {approvedReviews.map((rev) => (
                      <div key={rev.id} className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-850 dark:text-slate-100">{rev.customer_name}</span>
                          <span className="text-slate-400 font-medium">{new Date(rev.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed italic">
                          "{rev.content}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 p-6 text-xs">
                    No approved reviews for this package yet. Be the first to share your experience!
                  </div>
                )}

                {/* Submit review */}
                <ReviewForm tourId={tour.id} />
              </div>

            </div>

            {/* Right Sidebar - Sticky Booking Box */}
            <div className="lg:sticky lg:top-24 space-y-6">
              <BookingForm tour={tour} />
              
              <div className="bg-slate-900 text-white rounded-3xl p-6 text-center border border-slate-850 relative overflow-hidden">
                <div className="absolute inset-0 bg-navy-950/20" />
                <div className="relative z-10 space-y-3.5">
                  <Shield className="h-8 w-8 text-navy-400 mx-auto" />
                  <h4 className="font-bold text-sm text-slate-100">Safe & Secure Booking</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Your details are protected with 256-bit SSL encryption. Future-ready modules for direct payments are fully sandboxed.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* From the Journal */}
      {latestBlogs.length > 0 && (
        <section className="py-16 bg-white dark:bg-slate-950 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-navy-500 shrink-0" />
                <span>From the Journal</span>
              </h2>
              <Link href="/blog" className="text-xs font-bold text-navy-600 dark:text-navy-400 hover:text-navy-705 transition-colors">
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {latestBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </>
  );
}
