"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending message
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSuccess(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  if (success) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-500/20 rounded-3xl p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h3 className="font-serif text-lg font-bold text-emerald-800 dark:text-emerald-400">Message Dispatched!</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
          Thank you for reaching out to Vistana. Our luxury travel consultants will review your request and get back to you within 12 hours.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 underline decoration-dotted"
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full bg-slate-50 dark:bg-slate-900/40 border border-transparent focus:border-emerald-600/30 rounded-xl py-3 px-4 text-xs outline-none text-slate-805 dark:text-slate-200"
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
            className="w-full bg-slate-50 dark:bg-slate-900/40 border border-transparent focus:border-emerald-600/30 rounded-xl py-3 px-4 text-xs outline-none text-slate-805 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">Subject</label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Tailored Honeymoon Query, Mount Kilimanjaro Booking..."
          className="w-full bg-slate-50 dark:bg-slate-900/40 border border-transparent focus:border-emerald-600/30 rounded-xl py-3 px-4 text-xs outline-none text-slate-805 dark:text-slate-200"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 pl-1">How can we help?</label>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your travel dates, preferred locations, budget, and group size..."
          className="w-full bg-slate-50 dark:bg-slate-900/40 border border-transparent focus:border-emerald-600/30 rounded-xl py-3 px-4 text-xs outline-none text-slate-805 dark:text-slate-205 h-32 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
      >
        <span>{loading ? "Sending..." : "Send Message"}</span>
        <Send className="h-4 w-4 shrink-0" />
      </button>
    </form>
  );
}
