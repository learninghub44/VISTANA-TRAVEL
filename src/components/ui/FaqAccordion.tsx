"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Faq } from "@/services/db/types";

interface FaqAccordionProps {
  faqs: Faq[];
}

export default function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  if (faqs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-8 text-center text-xs text-slate-450 dark:text-slate-500">
        No FAQs available yet.
      </div>
    );
  }

  const sorted = [...faqs].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {sorted.map((f) => {
        const isOpen = openId === f.id;
        return (
          <div
            key={f.id}
            className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setOpenId(isOpen ? null : f.id)}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer"
            >
              <span className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white pr-4">
                {f.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {f.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
