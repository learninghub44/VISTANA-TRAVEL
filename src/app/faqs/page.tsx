import { cachedDb } from "@/services/db/cached";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FaqAccordion from "@/components/ui/FaqAccordion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about booking, payments, safaris, and travel to Kenya, Tanzania, and East Africa with Vistana Tours & Travel.",
  alternates: { canonical: "/faqs" },
};

export default async function FaqsPage() {
  const faqs = await cachedDb.getFaqs();

  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="bg-slate-900 text-white pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-navy-950/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold mb-3">Frequently Asked Questions</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light max-w-2xl mx-auto">
            Everything you need to know about booking your safari, payments, travel documents, and what to expect on the ground in East Africa.
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16 bg-slate-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FaqAccordion faqs={faqs} />
        </div>
      </section>

      <Footer />
    </>
  );
}
