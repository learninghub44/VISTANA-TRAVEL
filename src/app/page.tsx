import Link from "next/link";
import { db } from "@/services/db";
import { cachedDb } from "@/services/db/cached";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomeSearch from "@/components/layout/HomeSearch";
import TourCard from "@/components/ui/TourCard";
import DestinationCard from "@/components/ui/DestinationCard";
import BlogCard from "@/components/ui/BlogCard";
import FaqAccordion from "@/components/ui/FaqAccordion";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import { ShieldCheck, Compass, Users, Heart, Star, ArrowRight, Camera } from "lucide-react";
import { getSession } from "@/services/auth/session";

export default async function HomePage() {
  // Fetch data directly in server component
  const destinations = await cachedDb.getDestinations();
  const tours = await cachedDb.getTours();
  const blogs = await cachedDb.getBlogs();
  const partners = await cachedDb.getPartners();
  const testimonials = await cachedDb.getTestimonials(true);
  const faqs = await cachedDb.getFaqs();
  const galleryImages = await cachedDb.getGalleryImages();
  const socialPosts = await cachedDb.getSocialPosts();

  const session = await getSession();
  const profile = session ? await db.getProfileById(session.sub) : null;
  const favoriteIds = profile?.favorite_tour_ids || [];

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden bg-navy">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80"
            alt="Maasai Mara safari at sunset"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-navy/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white flex flex-col items-center">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gold bg-navy/50 px-4 py-2 rounded-full border border-gold/30 backdrop-blur-md mb-6">
            Tours · Travel · Booking
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl mb-6">
            Discover Africa&apos;s Most <br />
            <span className="bg-gradient-to-r from-gold via-amber-200 to-ocean bg-clip-text text-transparent">
              Unforgettable Adventures
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-200 max-w-3xl mb-12 leading-relaxed font-light">
            Book luxury safaris, hotels, flights, tours, holiday packages, and unique African experiences — all in one place.
          </p>

          <HomeSearch destinations={destinations} />
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-24 bg-slate-50 dark:bg-[#070a12] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <span className="text-xs font-bold text-ocean dark:text-ocean uppercase tracking-widest block mb-2">Where to go</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Popular Destinations
              </h2>
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-ocean dark:text-ocean hover:text-navy dark:hover:text-white transition-colors mt-4 md:mt-0 group"
            >
              <span>View All Destinations</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinations.slice(0, 4).map((dest) => {
              // Count tours in this destination
              const tourCount = tours.filter((t) => t.destination_id === dest.id).length;
              return <DestinationCard key={dest.id} destination={dest} tourCount={tourCount} />;
            })}
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="py-24 bg-white dark:bg-[#0b0f19] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <span className="text-xs font-bold text-ocean dark:text-ocean uppercase tracking-widest block mb-2">Handcrafted Journeys</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Featured Safaris & Tour Packages
              </h2>
            </div>
            <Link
              href="/tours"
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-ocean dark:text-ocean hover:text-navy dark:hover:text-white transition-colors mt-4 md:mt-0 group"
            >
              <span>Explore All Tours</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tours.slice(0, 3).map((tour) => {
              const dest = destinations.find((d) => d.id === tour.destination_id);
              return (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  destinationName={dest ? dest.name : "East Africa"}
                  isFavorited={favoriteIds.includes(tour.id)}
                  isLoggedIn={!!session}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-slate-50 dark:bg-[#070a12] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-ocean dark:text-ocean uppercase tracking-widest block mb-2">The Vistana Difference</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Why Discerning Travelers Choose Us
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
              We don't just organize trips; we curate deeply personal, immersive stories. Our commitment to luxury, local communities, and safety is unparalleled.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:shadow-lg transition-all text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-ocean/10 flex items-center justify-center mb-5 text-ocean dark:text-ocean">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2 text-slate-950 dark:text-white">5-Star Luxury Camps</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Carefully selected partner lodges offering high-end amenities, private decks, and five-star culinary dining.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:shadow-lg transition-all text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-ocean/10 flex items-center justify-center mb-5 text-ocean dark:text-ocean">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2 text-slate-950 dark:text-white">Bespoke Itineraries</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tailored completely to your physical level, dates, and interests, including private guide and customized 4x4 Land Cruisers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:shadow-lg transition-all text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-ocean/10 flex items-center justify-center mb-5 text-ocean dark:text-ocean">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="Expert Guides mb-2 font-serif font-bold text-lg text-slate-950 dark:text-white">Expert Guides</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Gold-rated resident guides and naturalists who speak fluent languages and know the migrations and bush behavior.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:shadow-lg transition-all text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-ocean/10 flex items-center justify-center mb-5 text-ocean dark:text-ocean">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="Eco-Conscious mb-2 font-serif font-bold text-lg text-slate-950 dark:text-white">Eco-Conscious</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                We contribute 5% of all booking revenues directly to local conservation and Maasai school initiatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Travel Stats & Testimonials Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Testimonials */}
            <div>
              <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-2">Guest Diaries</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-8">What Our Discerning Guests Say</h2>
              
              <div className="space-y-6">
                {testimonials.length > 0 ? (
                  testimonials.slice(0, 2).map((t) => (
                    <div key={t.id} className="bg-slate-800/50 border border-slate-700/40 p-6 sm:p-8 rounded-2xl backdrop-blur-sm">
                      <div className="flex space-x-1 mb-4 text-amber-400">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm text-slate-300 italic leading-relaxed mb-4">
                        "{t.content}"
                      </p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{t.customer_name}</span>
                        {t.customer_location && (
                          <span className="text-gold">{t.customer_location}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-800/50 border border-slate-700/40 p-6 sm:p-8 rounded-2xl backdrop-blur-sm text-sm text-slate-400">
                    No testimonials available yet.
                  </div>
                )}
              </div>
            </div>

            {/* Curated Collections (replaces the old stats/counter grid) */}
            <div>
              <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-2">Curated For You</span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold mb-6">Travel Collections</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Luxury Safaris", img: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80" },
                  { title: "Beach Escapes", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80" },
                  { title: "Honeymoon Getaways", img: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=600&q=80" },
                  { title: "Family Adventures", img: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?auto=format&fit=crop&w=600&q=80" },
                ].map((c) => (
                  <Link
                    key={c.title}
                    href="/tours"
                    className="group relative h-32 sm:h-36 rounded-2xl overflow-hidden border border-slate-800"
                  >
                    <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/20 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-sm font-bold text-white">{c.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Blog & News Section */}
      <section className="py-24 bg-white dark:bg-[#0b0f19] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <span className="text-xs font-bold text-ocean dark:text-ocean uppercase tracking-widest block mb-2">Vistana Journal</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Latest Travel Blog & Safari Guides
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-ocean dark:text-ocean hover:text-navy dark:hover:text-white transition-colors mt-4 md:mt-0 group"
            >
              <span>Read Our Blog</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.slice(0, 2).map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-slate-50 dark:bg-[#070a12] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-ocean dark:text-ocean uppercase tracking-widest block mb-2">Moments Captured</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Photo Gallery
            </h2>
          </div>

          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.slice(0, 8).map((g) => (
                <div key={g.id} className="relative aspect-square rounded-2xl overflow-hidden group">
                  <img
                    src={g.image_url}
                    alt={g.caption || "Vistana Tours gallery photo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {g.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium">{g.caption}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-3xl py-16">
              <Camera className="h-8 w-8 text-slate-350 dark:text-slate-600 mb-3" />
              <p className="text-xs text-slate-450 dark:text-slate-500">No gallery photos available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Social Feed Section */}
      <section className="py-24 bg-white dark:bg-[#0b0f19] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-ocean dark:text-ocean uppercase tracking-widest block mb-2">Follow Along</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              From Our Social Feed
            </h2>
          </div>

          {socialPosts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {socialPosts.slice(0, 8).map((post) => {
                const content = (
                  <>
                    <img
                      src={post.image_url}
                      alt={post.caption || "Vistana Tours social post"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-medium line-clamp-2">
                        {post.caption || `View on ${post.platform}`}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 rounded-full p-1.5">
                      <Camera className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                    </div>
                  </>
                );
                return post.post_url ? (
                  <a
                    key={post.id}
                    href={post.post_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-2xl overflow-hidden group block"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={post.id} className="relative aspect-square rounded-2xl overflow-hidden group">
                    {content}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-3xl py-16">
              <Camera className="h-8 w-8 text-slate-350 dark:text-slate-600 mb-3" />
              <p className="text-xs text-slate-450 dark:text-slate-500">No social posts available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white dark:bg-[#0b0f19] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-ocean dark:text-ocean uppercase tracking-widest block mb-2">Good to Know</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-2">Stay Inspired</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-4">
            Join Our Safari Newsletter
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto mb-8">
            Get travel inspiration, seasonal offers, and East Africa safari tips delivered straight to your inbox.
          </p>
          <NewsletterSignup />
        </div>
      </section>

      {/* Partner Logos */}
      <section className="py-12 bg-slate-50 dark:bg-[#070a12] border-t border-b border-slate-100 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-semibold mb-6">
            In Partnership & Compliance With
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-center">
            {partners.length > 0 ? (
              partners.map((p) => (
                <div key={p.id} className="flex justify-center items-center py-4 bg-white dark:bg-slate-900/35 border border-slate-100 dark:border-slate-800/60 rounded-xl px-4">
                  {p.logo_url ? (
                    <img
                      src={p.logo_url}
                      alt={p.name}
                      className="h-6 sm:h-8 object-contain grayscale opacity-70"
                    />
                  ) : (
                    <span className="font-serif font-bold text-xs sm:text-sm tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                      {p.name}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="col-span-2 md:col-span-4 text-center text-xs text-slate-400">
                No partners listed yet.
              </p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
