import { Queue } from "bullmq";
import IORedis from "ioredis";

let queue: Queue | null = null;
let connection: IORedis | null = null;

export function getVideoQueue() {
  if (queue) {
    return queue;
  }

  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is required to initialize the video queue.");
  }

  connection ??= new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  queue = new Queue("video-jobs", { connection });
  return queue;
}

export async function enqueueVideoJob<T>(name: string, data: T) {
  const videoQueue = getVideoQueue();
  return videoQueue.add(name, data, {
    removeOnComplete: 50,
    removeOnFail: 100,
  });
}
