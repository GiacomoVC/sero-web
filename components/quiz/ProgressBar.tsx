export function ProgressBar({ value }: { value: number }) {
  return (
    <div>
      <div className="w-full h-1.5 bg-sand/60 rounded-full overflow-hidden">
        <div
          className="h-full bg-coral transition-[width] duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
        />
      </div>
      <p className="mt-2 text-center text-ink/45 text-xs tracking-wide">
        El quiz toma 5 min, hazlo sin apuro.
      </p>
    </div>
  );
}
