"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-3xl text-slate-900 dark:text-slate-100 mb-2">
          Something went wrong
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          We hit an unexpected error while loading this page. You can try
          again, or head back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-medium transition-all hover:shadow-md"
          >
            Try Again
          </button>
          <a
            href="/"
            className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-3 rounded-full font-medium transition-all"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
