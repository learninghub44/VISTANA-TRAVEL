import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Globe, Camera, AtSign, Music2, Play, Briefcase, MessageCircle } from "lucide-react";
import { cachedDb } from "@/services/db/cached";
import NewsletterForm from "@/components/layout/NewsletterForm";

const SOCIAL_LINKS_CONFIG = [
  { key: "facebook_url" as const, label: "Facebook", icon: Globe },
  { key: "instagram_url" as const, label: "Instagram", icon: Camera },
  { key: "twitter_url" as const, label: "Twitter / X", icon: AtSign },
  { key: "tiktok_url" as const, label: "TikTok", icon: Music2 },
  { key: "youtube_url" as const, label: "YouTube", icon: Play },
  { key: "linkedin_url" as const, label: "LinkedIn", icon: Briefcase },
];

export default async function Footer() {
  const settings = await cachedDb.getSiteSettings();
  const activeSocialLinks = SOCIAL_LINKS_CONFIG.filter((s) => settings[s.key]);
  const whatsappHref = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 to-navy-950 dark:from-[#070a12] dark:to-navy-950 text-slate-300 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/brand/vistana-icon.png"
                alt="Vistana Tours & Travel"
                width={40}
                height={32}
                className="h-9 w-auto"
              />
              <span className="font-serif text-2xl font-bold tracking-wide text-white">
                Vistana
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Crafting premium, tailored safaris and travel experiences across Kenya, Tanzania, Zanzibar, and East Africa. Let us guide you on your next unforgettable journey.
            </p>
            {(activeSocialLinks.length > 0 || whatsappHref) && (
              <div className="flex space-x-4 pt-2">
                {activeSocialLinks.map(({ key, label, icon: Icon }) => (
                  <Link
                    key={key}
                    href={settings[key] as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="p-2.5 bg-white/5 hover:bg-gold-500 rounded-xl text-slate-400 hover:text-navy-950 border border-white/10 hover:border-gold-500 transition-all duration-300"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                ))}
                {whatsappHref && (
                  <Link
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="p-2.5 bg-white/5 hover:bg-gold-500 rounded-xl text-slate-400 hover:text-navy-950 border border-white/10 hover:border-gold-500 transition-all duration-300"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/tours" className="hover:text-gold-400 transition-colors">Featured Tours</Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-gold-400 transition-colors">Popular Destinations</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gold-400 transition-colors">Travel Blog & News</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-400 transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-gold-400 transition-colors">Customer Portal</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
                <span className="text-slate-400 leading-tight">
                  Vistana Plaza, Ngong Road,<br />Nairobi, Kenya
                </span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-5 w-5 text-gold-500 shrink-0" />
                <span className="text-slate-400">+254 700 123 456</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-5 w-5 text-gold-500 shrink-0" />
                <span className="text-slate-400">info@vistanatours.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-lg">Newsletter</h3>
            <p className="text-sm text-slate-400">
              Subscribe to get seasonal tour discounts and curated safari guides.
            </p>
            <NewsletterForm />
          </div>

        </div>

        <hr className="border-white/10 my-10" />

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Vistana Tours & Travel. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-gold-400 transition-colors">Terms of Service</Link>
            <Link href="/refund-policy" className="hover:text-gold-400 transition-colors">Refund Policy</Link>
            <Link href="/dpa" className="hover:text-gold-400 transition-colors">DPA</Link>
            <Link href="/msa" className="hover:text-gold-400 transition-colors">MSA</Link>
            <Link href="/cyber-liability-insurance" className="hover:text-gold-400 transition-colors">Cyber Insurance</Link>
            <Link href="/sitemap.xml" className="hover:text-gold-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
