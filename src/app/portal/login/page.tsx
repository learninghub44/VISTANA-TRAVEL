"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Invalid credentials.");
      } else {
        // Successful login
        window.dispatchEvent(new Event("vistana:auth-changed"));
        router.push(data.user.role === "admin" ? "/admin" : "/portal");
        router.refresh();
      }
    } catch (err) {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex bg-slate-50 dark:bg-[#070a12] transition-colors">
      {/* Image side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80"
          alt="Safari sunset over the Maasai Mara"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/30 to-navy-950/10" />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-semibold w-fit transition-colors">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Home
          </Link>
          <div>
            <span className="text-xs font-bold text-gold uppercase tracking-widest block mb-2">Welcome Back</span>
            <h2 className="font-serif text-3xl font-bold text-white leading-tight max-w-sm">
              Your next unforgettable journey is one login away.
            </h2>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800/80 shadow-xl flex flex-col justify-between">

          {/* Mobile back-to-home link (image side is hidden below lg) */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-navy-600 dark:text-navy-400 hover:text-navy-700 text-xs font-semibold w-fit mb-6">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 group mb-4">
              <Image
                src="/brand/vistana-icon-transparent.png"
                alt="Vistana Tours & Travel"
                width={46}
                height={37}
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-serif text-2xl font-bold tracking-wide bg-gradient-to-r from-navy-800 to-navy-600 dark:from-navy-400 dark:to-navy-200 bg-clip-text text-transparent">
                Vistana
              </span>
            </Link>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Access your customer portal to manage bookings and itineraries.
            </p>
          </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-500 pl-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-50 dark:bg-slate-850/50 border border-transparent focus:border-navy-600/30 rounded-xl py-3 pl-11 pr-4 text-sm outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-450 dark:text-slate-500 pl-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-850/50 border border-transparent focus:border-navy-600/30 rounded-xl py-3 pl-11 pr-4 text-sm outline-none text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium pl-1">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-navy-600 hover:bg-navy-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-sm flex items-center justify-center cursor-pointer"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-450 dark:text-slate-550 border-t border-slate-100 dark:border-slate-800 pt-4">
          Don't have an account?{" "}
          <Link href="/portal/register" className="text-navy-600 dark:text-navy-400 font-bold hover:underline">
            Register Here
          </Link>
        </div>

        </div>
      </div>
    </main>
  );
}
