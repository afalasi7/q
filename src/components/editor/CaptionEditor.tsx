"use client";

import type { CaptionSegment } from "@/types";

interface CaptionEditorProps {
  captions: CaptionSegment[];
  onChange: (captions: CaptionSegment[]) => void;
}

export function CaptionEditor({ captions, onChange }: CaptionEditorProps) {
  return (
    <div className="space-y-3">
      {captions.map((caption, index) => (
        <label
          key={`${caption.start}-${caption.end}-${index}`}
          className="block rounded-2xl border border-white/10 bg-white/5 p-3"
        >
          <div className="mb-2 flex items-center justify-between text-xs text-white/45">
            <span>
              {caption.start.toFixed(1)}s - {caption.end.toFixed(1)}s
            </span>
            <span>Segment {index + 1}</span>
          </div>
          <textarea
            value={caption.text}
            onChange={(event) => {
              const next = [...captions];
              next[index] = { ...caption, text: event.target.value };
              onChange(next);
            }}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
          />
        </label>
      ))}
    </div>
  );
}
