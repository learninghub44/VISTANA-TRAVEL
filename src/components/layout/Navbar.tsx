"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, LogOut, LayoutDashboard, Globe, ChevronDown } from "lucide-react";

const LANGUAGES = ["EN", "SW", "FR"];
const CURRENCIES = ["USD", "KES", "TZS", "EUR"];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [language, setLanguage] = useState("EN");
  const [currency, setCurrency] = useState("USD");
  const [langOpen, setLangOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      }
    };

    loadSession();
    // Re-check only when explicitly told to (login/logout), not on every route change.
    window.addEventListener("vistana:auth-changed", loadSession);

    return () => {
      cancelled = true;
      window.removeEventListener("vistana:auth-changed", loadSession);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Homepage gets a transparent-over-hero navbar; every other page keeps a solid bar
  // since there's no hero image behind it to blend with.
  const isHome = pathname === "/";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.dispatchEvent(new Event("vistana:auth-changed"));
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Destinations", href: "/destinations" },
    { name: "Safaris", href: "/safaris" },
    { name: "Tours", href: "/tours" },
    { name: "Hotels", href: "/hotels" },
    { name: "Flights", href: "/flights" },
    { name: "Holiday Packages", href: "/holiday-packages" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const solid = isScrolled || !isHome;

  const activeClass = (href: string) => {
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
    if (isActive) {
      return solid ? "text-ocean font-semibold" : "text-white font-semibold";
    }
    return solid
      ? "text-navy/70 hover:text-ocean dark:text-slate-300 dark:hover:text-ocean transition-colors"
      : "text-white/85 hover:text-white transition-colors";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid ? "bg-white/95 dark:bg-navy/95 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group shrink-0">
            <Image
              src="/brand/vistana-icon-transparent.png"
              alt="Vistana Tours & Travel"
              width={46}
              height={37}
              className="h-10 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              priority
            />
            <span
              className={`font-serif text-xl sm:text-2xl font-bold tracking-wide ${
                solid ? "text-navy dark:text-white" : "text-white"
              }`}
            >
              Vistana
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center space-x-5 2xl:space-x-6">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className={`text-[13px] font-medium whitespace-nowrap ${activeClass(link.href)}`}>
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden xl:flex items-center space-x-3">
            {/* Language / Currency selector */}
            <div className="relative hidden 2xl:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center space-x-1 text-xs font-semibold px-3 py-2 rounded-full border transition-colors ${
                  solid
                    ? "border-slate-200 text-navy/70 hover:border-ocean/40 dark:border-slate-700 dark:text-slate-300"
                    : "border-white/25 text-white hover:border-white/50"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{language} · {currency}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-navy shadow-xl border border-slate-100 dark:border-slate-800 p-3 space-y-3 z-50">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Language</p>
                    <div className="flex flex-wrap gap-1.5">
                      {LANGUAGES.map((l) => (
                        <button
                          key={l}
                          onClick={() => { setLanguage(l); setLangOpen(false); }}
                          className={`text-xs px-2.5 py-1 rounded-full ${
                            language === l ? "bg-ocean text-white" : "bg-slate-100 dark:bg-slate-800 text-navy/70 dark:text-slate-300"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Currency</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CURRENCIES.map((c) => (
                        <button
                          key={c}
                          onClick={() => { setCurrency(c); setLangOpen(false); }}
                          className={`text-xs px-2.5 py-1 rounded-full ${
                            currency === c ? "bg-ocean text-white" : "bg-slate-100 dark:bg-slate-800 text-navy/70 dark:text-slate-300"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-ocean/30 text-ocean bg-ocean/10 hover:bg-ocean/20 transition-colors"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <Link
                  href="/portal"
                  className={`flex items-center space-x-1 text-sm font-medium ${solid ? "text-navy/70 hover:text-ocean dark:text-slate-300" : "text-white/90 hover:text-white"}`}
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className={`p-1.5 rounded-full transition-colors ${solid ? "text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:text-slate-400" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/portal/login"
                  className={`text-sm font-medium transition-colors ${solid ? "text-navy/70 hover:text-ocean dark:text-slate-300" : "text-white/90 hover:text-white"}`}
                >
                  Sign In
                </Link>
                <Link
                  href="/portal/register"
                  className={`text-sm font-medium transition-colors ${solid ? "text-navy/70 hover:text-ocean dark:text-slate-300" : "text-white/90 hover:text-white"}`}
                >
                  Register
                </Link>
              </div>
            )}

            <Link
              href="/tours"
              className="text-sm font-semibold px-5 py-2.5 rounded-full text-white bg-gold hover:brightness-95 shadow-md hover:shadow-lg transition-all"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 focus:outline-none ${solid ? "text-navy dark:text-slate-300" : "text-white"}`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="xl:hidden bg-white dark:bg-navy shadow-lg border-t border-slate-200/20 px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  ? "text-ocean font-semibold"
                  : "text-navy/80 dark:text-slate-300"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="flex items-center space-x-2 px-3 pt-2">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`text-xs px-2.5 py-1 rounded-full ${language === l ? "bg-ocean text-white" : "bg-slate-100 dark:bg-slate-800 text-navy/70 dark:text-slate-300"}`}
              >
                {l}
              </button>
            ))}
            <span className="text-slate-300 dark:text-slate-700">|</span>
            {CURRENCIES.map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`text-xs px-2.5 py-1 rounded-full ${currency === c ? "bg-ocean text-white" : "bg-slate-100 dark:bg-slate-800 text-navy/70 dark:text-slate-300"}`}
              >
                {c}
              </button>
            ))}
          </div>

          <hr className="border-slate-200/20" />
          {user ? (
            <div className="space-y-2 pt-2">
              <p className="px-3 text-xs text-slate-500 dark:text-slate-400">Logged in as {user.name}</p>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-ocean bg-ocean/10"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <Link
                href="/portal"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-navy/80 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="h-5 w-5" />
                <span>Customer Portal</span>
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                href="/portal/login"
                onClick={() => setIsOpen(false)}
                className="text-center py-2.5 rounded-full border border-slate-300 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/portal/register"
                onClick={() => setIsOpen(false)}
                className="text-center py-2.5 rounded-full border border-slate-300 dark:border-slate-700 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Register
              </Link>
              <Link
                href="/tours"
                onClick={() => setIsOpen(false)}
                className="text-center py-2.5 rounded-full text-white bg-gold text-sm font-semibold shadow-md"
              >
                Book Now
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
