export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#FAF9F6] z-[9999] flex flex-col items-center justify-center gap-4 transition-all duration-300">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-orange-600 animate-spin"></div>
        <div className="absolute inset-3 rounded-full bg-slate-900 opacity-80 animate-pulse"></div>
      </div>
      <span className="text-xs font-bold text-slate-550 uppercase tracking-[0.25em] animate-pulse">
        Loading...
      </span>
    </div>
  );
}
