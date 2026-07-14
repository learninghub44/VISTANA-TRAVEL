"use client";

import { Send } from "lucide-react";

export default function NewsletterForm() {
  return (
    <form className="flex space-x-1 mt-2" onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        placeholder="Your email address"
        className="w-full px-4 py-2.5 rounded-l-full bg-slate-800 text-slate-200 border-none outline-none focus:ring-1 focus:ring-navy-500 text-sm"
      />
      <button
        type="submit"
        className="bg-navy-600 hover:bg-navy-700 text-white px-4 py-2.5 rounded-r-full hover:shadow-md transition-all flex items-center justify-center shrink-0"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
