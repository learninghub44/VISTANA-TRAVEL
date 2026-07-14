import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ShieldCheck, Heart, Globe2, Compass, Award, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Vistana Tours & Travel crafts premium, tailor-made safaris and holidays across East Africa. Learn our story and values.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: Heart, title: "Genuine Care", desc: "Every itinerary is designed around you — your pace, your interests, your budget." },
  { icon: ShieldCheck, title: "Trust & Safety", desc: "Vetted guides, insured vehicles, and 24/7 support on every trip we run." },
  { icon: Globe2, title: "Local Impact", desc: "We partner with community-owned camps and conservancies across the region." },
  { icon: Award, title: "Uncompromising Quality", desc: "Only lodges, guides, and vehicles that meet our own premium standard." },
];

const STATS = [
  { value: "12+", label: "Years Curating East African Journeys" },
  { value: "4,000+", label: "Travelers Guided" },
  { value: "3", label: "Countries Covered" },
  { value: "4.9/5", label: "Average Traveler Rating" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <section className="relative pt-32 pb-24 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80"
            alt="Safari vehicle overlooking the Maasai Mara plains"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/40" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-3">Our Story</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold mb-5 leading-tight">
            Built by Travelers, For Travelers Who Expect More
          </h1>
          <p className="text-slate-300 text-sm font-light leading-relaxed max-w-2xl mx-auto">
            Vistana Tours & Travel began with a simple belief: East Africa deserves to be experienced properly — without compromise, without guesswork, and without the impersonal feel of mass-market booking sites. Today we design bespoke safaris, hotel stays, and holiday packages for travelers who want it done right the first time.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white dark:bg-[#0b0f19] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl sm:text-4xl font-extrabold text-gradient-navy dark:text-white">{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-slate-50 dark:bg-[#070a12] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-ocean uppercase tracking-widest block mb-2">What Drives Us</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 hover:shadow-lg transition-all text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-ocean/10 flex items-center justify-center mb-5 text-ocean">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team-style CTA */}
      <section className="py-16 bg-white dark:bg-[#0b0f19] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-2">Meet the Team</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-5">
              Career Safari Designers, Not Call-Centre Agents
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
              Every Vistana consultant has lived and traveled extensively across East Africa. When you speak to us, you&apos;re speaking with someone who has walked the trails, stayed in the camps, and can tell you honestly what&apos;s worth your time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-navy-600 hover:bg-navy-700 text-white font-bold text-sm px-7 py-3.5 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Talk to a Consultant
              </Link>
              <Link
                href="/tours"
                className="bg-transparent border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm px-7 py-3.5 rounded-full hover:border-ocean/40 transition-all"
              >
                Browse Tours
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center">
              <Compass className="h-7 w-7 text-ocean mb-3" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Expert-led itinerary design</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 flex flex-col items-center text-center mt-6">
              <Users className="h-7 w-7 text-ocean mb-3" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Groups, honeymoons & solo trips</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
