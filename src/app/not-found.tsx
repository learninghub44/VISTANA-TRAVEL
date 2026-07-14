import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-navy-600/10 flex items-center justify-center">
          <Compass className="w-8 h-8 text-navy-600" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-6xl text-slate-900 dark:text-slate-100 mb-2">
          404
        </h1>
        <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          Looks like you&apos;ve wandered off the trail
        </p>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-navy-600 hover:bg-navy-700 text-white px-6 py-3 rounded-full font-medium transition-all hover:shadow-md"
          >
            Back to Home
          </Link>
          <Link
            href="/tours"
            className="border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-3 rounded-full font-medium transition-all"
          >
            Browse Tours
          </Link>
        </div>
      </div>
    </div>
  );
}
