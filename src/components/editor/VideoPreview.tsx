import type { CaptionSegment, TemplateConfig } from "@/types";

interface VideoPreviewProps {
  src: string;
  captions: CaptionSegment[];
  template: TemplateConfig | null;
}

export function VideoPreview({ src, captions, template }: VideoPreviewProps) {
  const latestCaption = captions[0]?.text;

  return (
    <div className="relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl shadow-black/40">
      <video src={src} controls className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 text-xs uppercase tracking-[0.2em] text-white/70">
        <span>{template?.name ?? "Preview"}</span>
        <span>{template?.aspectRatio ?? "9:16"}</span>
      </div>
      {latestCaption ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-5 rounded-2xl bg-black/55 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur-sm">
          {latestCaption}
        </div>
      ) : null}
    </div>
  );
}
