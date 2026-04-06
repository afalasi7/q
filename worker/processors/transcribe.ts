import { createReadStream } from "node:fs";
import type { Job } from "bullmq";
import OpenAI from "openai";
import { markJobDone, markJobProcessing, updateJobProgress } from "../shared/jobs";
import { cleanupFiles, downloadFromBucket } from "../shared/storage";
import { supabaseAdmin } from "../shared/supabase";

type TranscribeJobData = {
  projectId: string;
};

type ProjectRow = {
  id: string;
  original_video_path: string | null;
};

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export async function processTranscribe(job: Job<TranscribeJobData>) {
  const inputPath = `/tmp/q-${job.data.projectId}-transcribe.mp4`;

  try {
    await markJobProcessing(job);

    if (!openai) {
      throw new Error("OPENAI_API_KEY is required for transcription.");
    }

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .select("id, original_video_path")
      .eq("id", job.data.projectId)
      .single<ProjectRow>();

    if (error || !project?.original_video_path) {
      throw new Error(error?.message ?? "Project video not found.");
    }

    await updateJobProgress(job, 10);
    await downloadFromBucket("videos", project.original_video_path, inputPath);
    await updateJobProgress(job, 45);

    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(inputPath),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    const segments = (transcription.segments ?? []).map((segment) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text.trim(),
    }));

    await updateJobProgress(job, 85);

    await supabaseAdmin.from("captions").upsert(
      {
        project_id: project.id,
        language: transcription.language ?? "auto",
        segments,
        source: "whisper",
        version: 1,
      },
      { onConflict: "project_id" },
    );

    await supabaseAdmin.from("projects").update({ last_error: null }).eq("id", project.id);

    const result = { segmentsCount: segments.length, language: transcription.language ?? "auto" };
    await markJobDone(job, result);
    return result;
  } catch (error) {
    await supabaseAdmin
      .from("projects")
      .update({ last_error: error instanceof Error ? error.message : "Transcription failed" })
      .eq("id", job.data.projectId);
    throw error;
  } finally {
    await cleanupFiles([inputPath]);
  }
}
