"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Send } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setMessage(data.message || "You're subscribed!");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center justify-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl py-4 px-6 max-w-lg mx-auto">
        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
        <span className="text-sm text-emerald-300 font-medium">{message}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl text-sm flex items-center justify-center space-x-2 shadow transition-colors shrink-0 cursor-pointer"
        >
          <span>{status === "loading" ? "Subscribing..." : "Subscribe"}</span>
          {status !== "loading" && <Send className="h-4 w-4" />}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-400 mt-3 text-center">{message}</p>
      )}
    </form>
  );
}
