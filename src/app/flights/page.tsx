import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/contact/ContactForm";
import { Plane, Clock, ShieldCheck, Headset } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flights",
  description: "Let Vistana's travel consultants source and book the best domestic and international flights for your East African journey.",
  alternates: { canonical: "/flights" },
};

const PERKS = [
  { icon: Headset, title: "Personal Flight Consultant", desc: "A dedicated agent compares fares across airlines on your behalf." },
  { icon: Clock, title: "Fast Turnaround", desc: "Quotes within hours, tickets issued the same day where possible." },
  { icon: ShieldCheck, title: "Fully Protected Bookings", desc: "Transparent pricing with no hidden fees, plus 24/7 support." },
];

export default function FlightsPage() {
  return (
    <>
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden bg-navy-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80"
            alt="Aircraft wing above the clouds"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-3">Fly With Ease</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold mb-4">Flights, Sourced For You</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light max-w-2xl mx-auto leading-relaxed">
            Domestic hops between safari airstrips or long-haul international connections — our consultants find the best routing and fares so you don&apos;t have to.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-[#0b0f19] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PERKS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-slate-50 dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center mb-5 text-gold">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto bg-slate-50 dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-ocean/10 flex items-center justify-center text-ocean shrink-0">
              <Plane className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Request a Flight Quote</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Share your route and dates — we&apos;ll reply with options within hours.</p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <Footer />
    </>
  );
}
