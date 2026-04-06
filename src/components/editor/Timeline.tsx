interface TimelineProps {
  durationSeconds: number;
}

export function Timeline({ durationSeconds }: TimelineProps) {
  const markers = Array.from({ length: 6 }, (_, index) => index);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/45">
        <span>Timeline</span>
        <span>{Math.round(durationSeconds)} seconds</span>
      </div>
      <div className="relative h-16 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
        <div className="absolute left-[35%] top-0 h-full w-px bg-amber-300" />
        <div className="grid h-full grid-cols-6">
          {markers.map((marker) => (
            <div key={marker} className="border-r border-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
