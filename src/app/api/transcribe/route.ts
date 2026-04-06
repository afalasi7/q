import { NextResponse } from "next/server";
import { z } from "zod";
import { enqueueVideoJob } from "@/lib/queue/videoQueue";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const transcribeSchema = z.object({
  projectId: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = transcribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!process.env.REDIS_URL) {
    return NextResponse.json(
      { error: "REDIS_URL is required before queueing transcription jobs." },
      { status: 503 },
    );
  }

  const job = await enqueueVideoJob("transcribe", { projectId: parsed.data.projectId });

  if (hasSupabaseEnv()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("jobs").insert({
        project_id: parsed.data.projectId,
        user_id: user.id,
        status: "pending",
        job_type: "transcribe",
        bull_job_id: String(job.id),
        progress: 0,
      });
    }
  }

  return NextResponse.json({ jobId: job.id });
}
