import { promises as fs } from "node:fs";
import { supabaseAdmin } from "./supabase";

async function ensureParentDir(filePath: string) {
  const parent = filePath.split("/").slice(0, -1).join("/") || "/tmp";
  await fs.mkdir(parent, { recursive: true });
}

export async function downloadFromBucket(bucket: string, path: string, destination: string) {
  await ensureParentDir(destination);

  const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);

  if (error || !data) {
    throw new Error(error?.message ?? `Failed to download ${bucket}/${path}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  await fs.writeFile(destination, buffer);
}

export async function uploadToBucket(bucket: string, path: string, localPath: string, contentType: string) {
  const fileBuffer = await fs.readFile(localPath);
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, fileBuffer, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  return path;
}

export async function cleanupFiles(paths: string[]) {
  await Promise.all(
    paths.map(async (path) => {
      try {
        await fs.unlink(path);
      } catch {
        return;
      }
    }),
  );
}
