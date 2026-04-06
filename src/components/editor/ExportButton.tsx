"use client";

interface ExportButtonProps {
  onExport: () => Promise<void>;
  progress: number;
  disabled?: boolean;
  label?: string;
}

export function ExportButton({ onExport, progress, disabled, label }: ExportButtonProps) {
  return (
    <div className="space-y-3">
      {progress > 0 && progress < 100 ? (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/50">{progress}% complete</p>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => void onExport()}
        disabled={disabled}
        className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {label ?? "Export video"}
      </button>
    </div>
  );
}
