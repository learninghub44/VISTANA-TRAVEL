"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — real visitors never see or fill this
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phone || undefined, subject, message, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "We couldn't send your message. Please try again or contact us on WhatsApp.");
        return;
      }
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-navy-50 dark:bg-navy-950/15 border border-navy-500/20 rounded-3xl p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-navy-500/10 rounded-full flex items-center justify-center mx-auto text-navy-600 dark:text-navy-400">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h3 className="font-serif text-lg font-bold text-navy-800 dark:text-navy-400">Message Dispatched!</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
          Thank you for reaching out to Vistana. Our luxury travel consultants will review your request and get back to you within 12 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-xs font-semibold text-navy-600 dark:text-navy-400 underline decoration-dotted"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Full Name</label>
          <input
            type="text"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full bg-slate-50 dark:bg-slate-900/40 border border-transparent focus:border-navy-600/30 rounded-xl py-3 px-4 text-xs outline-none text-slate-805 dark:text-slate-200"
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            className="w-full bg-slate-50 dark:bg-slate-900/40 border border-transparent focus:border-navy-600/30 rounded-xl py-3 px-4 text-xs outline-none text-slate-805 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Phone / WhatsApp (optional)</label>
        <input
          type="tel"
          value={phone}
          maxLength={24}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+254 700 000 000"
          className="w-full bg-slate-50 dark:bg-slate-900/40 border border-transparent focus:border-navy-600/30 rounded-xl py-3 px-4 text-xs outline-none text-slate-805 dark:text-slate-200"
        />
      </div>

      {/* Honeypot: off-screen, skipped by keyboard/screen readers; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Subject</label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Tailored Honeymoon Query, Mount Kilimanjaro Booking..."
          className="w-full bg-slate-50 dark:bg-slate-900/40 border border-transparent focus:border-navy-600/30 rounded-xl py-3 px-4 text-xs outline-none text-slate-805 dark:text-slate-200"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">How can we help?</label>
        <textarea
          required
          minLength={10}
          maxLength={3000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your travel dates, preferred locations, budget, and group size..."
          className="w-full bg-slate-50 dark:bg-slate-900/40 border border-transparent focus:border-navy-600/30 rounded-xl py-3 px-4 text-xs outline-none text-slate-805 dark:text-slate-205 h-32 resize-none"
        />
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Please don&apos;t include passport, ID or card numbers in your message.
      </p>

      {error && (
        <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl py-2.5 px-4">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-navy-600 hover:bg-navy-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span>{loading ? "Sending..." : "Send Message"}</span>
        <Send className="h-4 w-4 shrink-0" />
      </button>
    </form>
  );
}
