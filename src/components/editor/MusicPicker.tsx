"use client";

const tracks = [
  { id: "dubai_ambient_01", label: "Dubai Ambient" },
  { id: "oud_night_01", label: "Oud Night" },
  { id: "none", label: "No music" },
];

interface MusicPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function MusicPicker({ value, onChange }: MusicPickerProps) {
  return (
    <div className="space-y-2 p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">Music</p>
        <h3 className="mt-2 text-base font-semibold text-white">Background track</h3>
      </div>
      <div className="grid gap-2">
        {tracks.map((track) => (
          <button
            key={track.id}
            type="button"
            onClick={() => onChange(track.id)}
            className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
              value === track.id
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white hover:border-white/20"
            }`}
          >
            {track.label}
          </button>
        ))}
      </div>
    </div>
  );
}
