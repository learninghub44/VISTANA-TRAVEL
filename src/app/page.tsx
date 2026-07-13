import Link from "next/link";
import { db } from "@/services/db";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HomeSearch from "@/components/layout/HomeSearch";
import TourCard from "@/components/ui/TourCard";
import DestinationCard from "@/components/ui/DestinationCard";
import BlogCard from "@/components/ui/BlogCard";
import { ShieldCheck, Compass, Users, Heart, Star, ArrowRight } from "lucide-react";

export default async function HomePage() {
  // Fetch data directly in server component
  const destinations = await db.getDestinations();
  const tours = await db.getTours();
  const blogs = await db.getBlogs();
  const partners = await db.getPartners();
  const testimonials = await db.getTestimonials(true);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-12 overflow-hidden bg-slate-950">
        {/* Background Image with Parallax look */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80"
            alt="East Africa Safari Hero"
            className="w-full h-full object-cover opacity-60 scale-105 animate-[pulse_10s_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-slate-950/60" />
          <div className="absolute inset-0 bg-emerald-950/20" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white flex flex-col items-center">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/40 px-4 py-2 rounded-full border border-emerald-500/20 backdrop-blur-md mb-6 animate-fade-in">
            Luxury & Adventure Travel Experts
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl mb-6">
            Unveiling East Africa’s <br />
            <span className="bg-gradient-to-r from-emerald-400 via-amber-200 to-amber-400 bg-clip-text text-transparent">
              Untamed Luxury
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-200 max-w-3xl mb-12 leading-relaxed font-light">
            Bespoke safaris, tropical beach escapes, and high-altitude climbs across Kenya, Tanzania, and Zanzibar. Experience the wild in ultimate comfort.
          </p>

          {/* Glassmorphic Search Bar */}
          <HomeSearch destinations={destinations} />
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-24 bg-slate-50 dark:bg-[#070a12] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">Where to go</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Popular Destinations
              </h2>
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mt-4 md:mt-0 group"
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
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">Handcrafted Journeys</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Featured Safaris & Tour Packages
              </h2>
            </div>
            <Link
              href="/tours"
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mt-4 md:mt-0 group"
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
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">The Vistana Difference</span>
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
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2 text-slate-950 dark:text-white">5-Star Luxury Camps</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Carefully selected partner lodges offering high-end amenities, private decks, and five-star culinary dining.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:shadow-lg transition-all text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 text-emerald-600 dark:text-emerald-400">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-lg mb-2 text-slate-950 dark:text-white">Bespoke Itineraries</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tailored completely to your physical level, dates, and interests, including private guide and customized 4x4 Land Cruisers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:shadow-lg transition-all text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 text-emerald-600 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="Expert Guides mb-2 font-serif font-bold text-lg text-slate-950 dark:text-white">Expert Guides</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Gold-rated resident guides and naturalists who speak fluent languages and know the migrations and bush behavior.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:shadow-lg transition-all text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 text-emerald-600 dark:text-emerald-400">
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
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">Guest Diaries</span>
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
                          <span className="text-emerald-400">{t.customer_location}</span>
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

            {/* Travel Stats */}
            <div className="grid grid-cols-2 gap-8 text-center bg-slate-800/25 p-10 rounded-3xl border border-slate-800 backdrop-blur-md">
              <div>
                <span className="block font-serif text-4xl sm:text-5xl font-extrabold text-emerald-400">15k+</span>
                <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mt-2">Happy Guests</span>
              </div>
              <div>
                <span className="block font-serif text-4xl sm:text-5xl font-extrabold text-emerald-400">120+</span>
                <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mt-2">Safari Routes</span>
              </div>
              <div className="border-t border-slate-800/70 pt-8">
                <span className="block font-serif text-4xl sm:text-5xl font-extrabold text-emerald-400">98.7%</span>
                <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mt-2">Satisfaction</span>
              </div>
              <div className="border-t border-slate-800/70 pt-8">
                <span className="block font-serif text-4xl sm:text-5xl font-extrabold text-emerald-400">15+</span>
                <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold mt-2">Years Active</span>
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
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">Vistana Journal</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                Latest Travel Blog & Safari Guides
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center space-x-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mt-4 md:mt-0 group"
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
