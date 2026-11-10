import Navbar from "@/components/layout/Navbar";
import AssistantChat from "@/components/ai/AssistantChat";
import { cachedDb } from "@/services/db/cached";
import { buildWhatsAppUrl, normalizeWhatsAppNumber } from "@/lib/whatsapp";
import { Compass, CalendarCheck, Ticket, Map } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Trip Planner",
  description: "Plan your East African trip with our AI planner — get a day-by-day itinerary, book a tour, or set up a call with a safari designer.",
  alternates: { canonical: "/assistant" },
};

const FEATURES = [
  { icon: Map, title: "Plan your trip", text: "Day-by-day itineraries built from our real tours and prices." },
  { icon: Ticket, title: "Book a tour", text: "Review the details, then confirm — nothing is booked without you." },
  { icon: CalendarCheck, title: "Talk to a person", text: "Arrange a video, phone or WhatsApp call with a safari designer." },
];

export default async function AssistantPage() {
  const settings = await cachedDb.getSiteSettings().catch(() => null);
  const whatsappHref = buildWhatsAppUrl(normalizeWhatsAppNumber(settings?.whatsapp_number) ?? "254701059192");

  return (
    <>
      <Navbar />
      <main className="pt-20 bg-slate-50 dark:bg-[#0b0f19]">
        <div className="mx-auto max-w-[1500px] lg:grid lg:grid-cols-[340px_1fr] h-[calc(100dvh-5rem)]">
          <aside className="hidden lg:flex flex-col gap-6 bg-gradient-to-b from-slate-900 to-navy-900 text-white p-8 overflow-y-auto">
            <div>
              <span className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4"><Compass className="h-6 w-6 text-gold" /></span>
              <h1 className="font-serif text-3xl font-extrabold leading-tight">Your AI trip planner</h1>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">Tell me when, who&apos;s travelling and what you love. I&apos;ll do the planning.</p>
            </div>
            <ul className="space-y-5">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="h-9 w-9 shrink-0 rounded-xl bg-white/10 flex items-center justify-center"><Icon className="h-4 w-4 text-gold" /></span>
                  <div><p className="font-bold text-sm">{title}</p><p className="text-xs text-slate-300 leading-relaxed">{text}</p></div>
                </li>
              ))}
            </ul>
            <p className="mt-auto text-[11px] text-slate-400 leading-relaxed">Prices and availability are confirmed by our team. Please never share passport or card details in the chat.</p>
          </aside>
          <section className="min-h-0 h-full flex flex-col bg-white dark:bg-slate-900 lg:border-l border-slate-100 dark:border-slate-800">
            <div className="lg:hidden px-4 pt-4 pb-2">
              <h1 className="font-serif text-xl font-extrabold text-slate-900 dark:text-white">AI trip planner</h1>
            </div>
            <div className="flex-1 min-h-0"><AssistantChat variant="page" whatsappHref={whatsappHref} /></div>
          </section>
        </div>
      </main>
    </>
  );
}
