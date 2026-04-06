import { NextResponse } from "next/server";
import { z } from "zod";
import { enqueueVideoJob } from "@/lib/queue/videoQueue";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const exportSchema = z.object({
  projectId: z.string().min(1),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = exportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!process.env.REDIS_URL) {
    return NextResponse.json(
      { error: "REDIS_URL is required before queueing export jobs." },
      { status: 503 },
    );
  }

  const job = await enqueueVideoJob("export", parsed.data);

  if (hasSupabaseEnv()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("projects").update({ status: "processing" }).eq("id", parsed.data.projectId);
      await supabase.from("jobs").insert({
        project_id: parsed.data.projectId,
        user_id: user.id,
        status: "pending",
        job_type: "export",
        bull_job_id: String(job.id),
        progress: 0,
        result: parsed.data.settings ?? {},
      });
    }
  }

  return NextResponse.json({ jobId: job.id });
}
