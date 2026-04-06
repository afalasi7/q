"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTemplateById } from "@/lib/templates";
import { useEditorStore } from "@/store/editorStore";
import { CaptionEditor } from "@/components/editor/CaptionEditor";
import { ExportButton } from "@/components/editor/ExportButton";
import { MusicPicker } from "@/components/editor/MusicPicker";
import { TemplateSelector } from "@/components/editor/TemplateSelector";
import { Timeline } from "@/components/editor/Timeline";
import { VideoPreview } from "@/components/editor/VideoPreview";
import type { CaptionSegment, ProjectRecord } from "@/types";

interface EditorShellProps {
  project: ProjectRecord;
  initialCaptions: CaptionSegment[];
  isDemo: boolean;
}

export function EditorShell({ project, initialCaptions, isDemo }: EditorShellProps) {
  const router = useRouter();
  const { selectedTemplate, captions, progress, setTemplate, setCaptions, setProgress } =
    useEditorStore();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [music, setMusic] = useState("dubai_ambient_01");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeJobId || isDemo) {
      return;
    }

    const interval = setInterval(async () => {
      const response = await fetch(`/api/jobs/${activeJobId}`);

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setProgress(data.progress ?? 0);

      if (data.status === "done" || data.status === "failed") {
        clearInterval(interval);
        setJobError(data.status === "failed" ? (data.errorMessage ?? "Job failed") : null);
        setActiveJobId(null);
        setIsExporting(false);
        setIsTranscribing(false);
        router.refresh();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeJobId, isDemo, router, setProgress]);

  useEffect(() => {
    if (!selectedTemplate) {
      setTemplate(getTemplateById("dubai-reels"));
    }

    if (captions.length === 0) {
      setCaptions(initialCaptions);
    }
  }, [captions.length, initialCaptions, selectedTemplate, setCaptions, setTemplate]);

  async function handleTranscribe() {
    if (isDemo) {
      setIsTranscribing(true);
      setTimeout(() => {
        setCaptions(initialCaptions);
        setIsTranscribing(false);
      }, 900);
      return;
    }

    setIsTranscribing(true);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      const data = await response.json();

      if (response.ok && data.jobId) {
        setJobError(null);
        setActiveJobId(String(data.jobId));
      } else {
        setIsTranscribing(false);
        setJobError(data.error ?? "Unable to queue transcription.");
      }
    } finally {
      if (isDemo) {
        setIsTranscribing(false);
      }
    }
  }

  async function handleExport() {
    if (!isDemo) {
      setIsExporting(true);
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          settings: {
            templateId: selectedTemplate?.id,
            music,
            captionsEnabled: captions.length > 0,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.jobId) {
        setJobError(null);
        setActiveJobId(String(data.jobId));
        setProgress(1);
      } else {
        setIsExporting(false);
        setJobError(data.error ?? "Unable to queue export.");
      }
      return;
    }

    setProgress(15);
    setTimeout(() => setProgress(45), 450);
    setTimeout(() => setProgress(78), 900);
    setTimeout(() => setProgress(100), 1400);
  }

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white lg:flex-row">
      <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">Editor</p>
            <h1 className="mt-2 text-2xl font-semibold">{project.title}</h1>
            {isDemo ? <p className="mt-2 text-sm text-amber-300">Demo mode until Supabase env is set.</p> : null}
            {project.exportedVideoUrl ? (
              <a href={project.exportedVideoUrl} className="mt-2 block text-sm text-emerald-300 hover:underline">
                Download latest export
              </a>
            ) : null}
            {jobError ? <p className="mt-2 text-sm text-red-300">{jobError}</p> : null}
          </div>
          <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/65">
            {project.status}
          </div>
        </div>

        <div className="grid flex-1 gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="flex items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <VideoPreview
              src={project.originalVideoUrl ?? project.exportedVideoUrl ?? ""}
              captions={captions}
              template={selectedTemplate}
            />
          </div>

          <div className="space-y-6">
            <Timeline durationSeconds={project.durationSeconds} />

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">Captions</p>
                  <h2 className="mt-2 text-lg font-semibold">Auto captions</h2>
                </div>
                <button
                  type="button"
                  onClick={() => void handleTranscribe()}
                  disabled={isTranscribing}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:border-white/20"
                >
                  {isTranscribing ? "Generating..." : "Generate"}
                </button>
              </div>
              <CaptionEditor captions={captions} onChange={setCaptions} />
            </div>
          </div>
        </div>
      </div>

      <aside className="w-full border-l border-white/10 bg-black/30 lg:max-w-md">
        <TemplateSelector selected={selectedTemplate} onSelect={setTemplate} />
        <MusicPicker value={music} onChange={setMusic} />
        <div className="p-4">
          <ExportButton
            onExport={handleExport}
            progress={progress}
            disabled={isExporting}
            label={isExporting ? "Exporting..." : "Export video"}
          />
        </div>
      </aside>
    </div>
  );
}
