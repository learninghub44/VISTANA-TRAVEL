import Link from "next/link";
import { Compass, Mail, Phone, MapPin, Send, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 dark:bg-[#070a12] border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Compass className="h-8 w-8 text-emerald-400" />
              <span className="font-serif text-2xl font-bold tracking-wide text-white">
                Vistana
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Crafting premium, tailored safaris and travel experiences across Kenya, Tanzania, Zanzibar, and East Africa. Let us guide you on your next unforgettable journey.
            </p>
            <div className="flex space-x-4 pt-2">
              <Link href="#" className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-full text-slate-400 hover:text-white transition-all">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-full text-slate-400 hover:text-white transition-all">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-full text-slate-400 hover:text-white transition-all">
                <Twitter className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Explore</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/tours" className="hover:text-emerald-400 transition-colors">Featured Tours</Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-emerald-400 transition-colors">Popular Destinations</Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-emerald-400 transition-colors">Travel Blog & News</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-emerald-400 transition-colors">Customer Portal</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-400 leading-tight">
                  Vistana Plaza, Ngong Road,<br />Nairobi, Kenya
                </span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="text-slate-400">+254 700 123 456</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-5 w-5 text-emerald-400 shrink-0" />
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
            <form className="flex space-x-1 mt-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-4 py-2.5 rounded-l-full bg-slate-800 text-slate-200 border-none outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-r-full hover:shadow-md transition-all flex items-center justify-center shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>

        <hr className="border-slate-800 my-10" />

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Vistana Tours & Travel. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-slate-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
