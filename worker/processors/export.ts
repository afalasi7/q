import type { Job } from "bullmq";
import { buildFFmpegArgs } from "../shared/ffmpeg";
import { markJobDone, markJobProcessing, updateJobProgress } from "../shared/jobs";
import { runCommand } from "../shared/process";
import { cleanupFiles, downloadFromBucket, uploadToBucket } from "../shared/storage";
import { supabaseAdmin } from "../shared/supabase";

type ExportJobData = {
  projectId: string;
  settings?: {
    templateId?: string;
  };
};

type ProjectRow = {
  id: string;
  user_id: string;
  original_video_path: string | null;
};

export async function processExport(job: Job<ExportJobData>) {
  const inputPath = `/tmp/q-${job.data.projectId}-input.mp4`;
  const outputPath = `/tmp/q-${job.data.projectId}-output.mp4`;

  try {
    await markJobProcessing(job);

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .select("id, user_id, original_video_path")
      .eq("id", job.data.projectId)
      .single<ProjectRow>();

    if (error || !project?.original_video_path) {
      throw new Error(error?.message ?? "Project video not found.");
    }

    await updateJobProgress(job, 10);
    await downloadFromBucket("videos", project.original_video_path, inputPath);

    await updateJobProgress(job, 35);
    const ffmpegArgs = buildFFmpegArgs({
      inputPath,
      outputPath,
      resolution: "1080x1920",
      fps: 30,
      filters: [{ type: "contrast", value: 1.05 }],
    });

    await runCommand("ffmpeg", ffmpegArgs);
    await updateJobProgress(job, 75);

    const exportPath = `${project.user_id}/${project.id}/export.mp4`;
    await uploadToBucket("exports", exportPath, outputPath, "video/mp4");

    await supabaseAdmin
      .from("projects")
      .update({
        status: "done",
        exported_video_path: exportPath,
        last_error: null,
      })
      .eq("id", project.id);

    const result = { exportedVideoPath: exportPath };
    await markJobDone(job, result);
    return result;
  } catch (error) {
    await supabaseAdmin
      .from("projects")
      .update({ status: "failed", last_error: error instanceof Error ? error.message : "Export failed" })
      .eq("id", job.data.projectId);
    throw error;
  } finally {
    await cleanupFiles([inputPath, outputPath]);
  }
}
