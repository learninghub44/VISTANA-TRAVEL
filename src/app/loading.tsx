export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-navy-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading&hellip;</p>
      </div>
    </div>
  );
}
