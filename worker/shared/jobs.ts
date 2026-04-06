import type { Job } from "bullmq";
import { supabaseAdmin } from "./supabase";

export async function markJobProcessing(job: Job) {
  await supabaseAdmin
    .from("jobs")
    .update({
      status: "processing",
      progress: 1,
      started_at: new Date().toISOString(),
      attempts: job.attemptsMade,
    })
    .eq("bull_job_id", String(job.id));
}

export async function updateJobProgress(job: Job, progress: number) {
  await job.updateProgress(progress);
  await supabaseAdmin
    .from("jobs")
    .update({ status: "processing", progress })
    .eq("bull_job_id", String(job.id));
}

export async function markJobDone(job: Job, result: Record<string, unknown>) {
  await supabaseAdmin
    .from("jobs")
    .update({
      status: "done",
      progress: 100,
      result,
      completed_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("bull_job_id", String(job.id));
}

export async function markJobFailed(job: Job, error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown worker error";

  await supabaseAdmin
    .from("jobs")
    .update({
      status: "failed",
      error_message: message,
      completed_at: new Date().toISOString(),
    })
    .eq("bull_job_id", String(job.id));
}
