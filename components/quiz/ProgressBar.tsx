export function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div>
      <div className="relative w-full h-1.5 bg-sand/60 rounded-full overflow-visible">
        <div
          className="h-full bg-coral rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
        {/* Travelling dot */}
        <span
          aria-hidden
          className="absolute -top-1 w-3.5 h-3.5 rounded-full bg-coral border-2 border-cream shadow-[0_0_0_3px_rgba(255,107,94,0.18)] transition-[left] duration-500 ease-out"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
      <p className="mt-3 text-center text-ink/45 text-xs tracking-wide">
        El quiz toma 5 min, hazlo sin apuro <span aria-hidden>✨</span>
      </p>
    </div>
  );
}
