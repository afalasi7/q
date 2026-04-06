import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: RouteProps) {
  const { id } = await params;

  if (hasSupabaseEnv()) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("jobs")
      .select("id, status, progress, result, error_message")
      .or(`id.eq.${id},bull_job_id.eq.${id}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data) {
      return NextResponse.json({
        id: data.id,
        status: data.status,
        progress: data.progress,
        result: data.result,
        errorMessage: data.error_message,
      });
    }
  }

  return NextResponse.json({
    id,
    status: "pending",
    progress: 0,
    result: null,
    message: "Hook this route to BullMQ and Supabase job records next.",
  });
}
