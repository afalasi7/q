import { Worker } from "bullmq";
import Redis from "ioredis";
import { processExport } from "./processors/export";
import { processTranscribe } from "./processors/transcribe";
import { markJobFailed } from "./shared/jobs";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is required to start the worker.");
}

const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

const worker = new Worker(
  "video-jobs",
  async (job) => {
    switch (job.name) {
      case "transcribe":
        return processTranscribe(job);
      case "export":
        return processExport(job);
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 1,
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed`, error);

  if (job) {
    void markJobFailed(job, error);
  }
});
