import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/contact/ContactForm";
import { Mail, MapPin, Compass, MessageSquare, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Vistana Tours & Travel to plan your bespoke East African safari or beach holiday.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Navbar />

      {/* Header */}
      <section className="bg-slate-900 text-white pt-32 pb-16 relative">
        <div className="absolute inset-0 bg-navy-950/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold mb-3">Get in Touch</h1>
          <p className="text-slate-300 text-xs sm:text-sm font-light max-w-2xl mx-auto">
            Our safari designers are available 24/7. Drop us a line or start a chat to begin co-creating your custom East African dream trip.
          </p>
        </div>
      </section>

      {/* Grid Details */}
      <section className="py-16 bg-slate-50 dark:bg-[#070a12] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* Left: Contact Info */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* WhatsApp Callout */}
              <div className="bg-navy-600 text-white p-6 rounded-3xl shadow-md border border-navy-500/20 flex flex-col justify-between h-48">
                <div className="space-y-2">
                  <MessageSquare className="h-7 w-7 text-white fill-current" />
                  <h3 className="font-serif font-bold text-lg leading-tight">Instant Safari Consulting</h3>
                  <p className="text-[11px] text-navy-100 font-light leading-relaxed">
                    Prefer direct chat? Text us on WhatsApp for rapid itineraries and price quotes.
                  </p>
                </div>
                <a
                  href="https://wa.me/254701059192"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-navy-700 font-bold text-xs py-2.5 px-4 rounded-full text-center hover:bg-navy-50 transition-colors uppercase tracking-wider block mt-3"
                >
                  Start WhatsApp Chat
                </a>
              </div>

              {/* Office Details */}
              <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-6 text-slate-805 dark:text-slate-200">
                <h3 className="font-serif font-bold text-lg pb-3 border-b border-slate-100 dark:border-slate-800">Office Head offices</h3>
                
                <div className="space-y-4 text-xs">
                  {/* Nairobi */}
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-navy-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-905 dark:text-white block">Nairobi Head Office</span>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5 font-light">
                        Vistana Plaza, 4th Floor, Ngong Road,<br />Nairobi, Kenya
                      </p>
                      <p className="text-slate-400 mt-1 font-semibold">
                        Phone: <a href="tel:+254701059192" className="hover:text-gold-400 transition-colors">+254 701 059 192</a>
                      </p>
                    </div>
                  </div>

                  {/* Arusha */}
                  <div className="flex items-start space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                    <MapPin className="h-5 w-5 text-navy-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-905 dark:text-white block">Arusha Liaison Office</span>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5 font-light">
                        Serengeti House, Safari Way,<br />Arusha, Tanzania
                      </p>
                      <p className="text-slate-400 mt-1 font-semibold">Phone: +255 750 987 654</p>
                    </div>
                  </div>

                  {/* General Email */}
                  <div className="flex items-center space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800/50">
                    <Mail className="h-5 w-5 text-navy-500 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-905 dark:text-white block">Email Inquiry</span>
                      <p className="text-slate-550 dark:text-slate-405 mt-0.5 font-light">info@vistanatours.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm">
                <h3 className="font-serif font-bold text-lg pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-navy-500" />
                  <span>Business Hours</span>
                </h3>
                <ul className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <li className="flex justify-between">
                    <span>Monday – Friday</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">7:00 AM – 8:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">8:00 AM – 6:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">9:00 AM – 3:00 PM</span>
                  </li>
                  <li className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <span>WhatsApp Support</span>
                    <span className="font-semibold text-gold-600 dark:text-gold-400">24/7</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Right: Contact Form */}
            <div className="bg-white dark:bg-slate-900/60 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm lg:col-span-2 space-y-6">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Send Us a Message</h2>
              <ContactForm />
            </div>

          </div>

          {/* Google Maps Embed */}
          <div className="mt-12 bg-white dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden">
            <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
              <iframe
                title="Vistana Tours & Travel — Nairobi Head Office Location"
                src="https://www.google.com/maps?q=Ngong+Road,+Nairobi,+Kenya&output=embed"
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute top-4 left-4 glassmorphism p-4 rounded-2xl max-w-xs border border-white/20 flex items-start gap-2.5">
                <Compass className="h-5 w-5 text-navy-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Vistana Headquarters</h4>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                    Ngong Road, Nairobi, Kenya — visitors welcome for fresh East African coffee!
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
