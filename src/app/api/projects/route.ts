import { NextResponse } from "next/server";
import { z } from "zod";
import { demoProjects } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const projectSchema = z.object({
  title: z.string().trim().min(1).max(120).default("Untitled Project"),
});

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ projects: demoProjects, demo: true });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id, title, status, duration_seconds, original_video_path, exported_video_path, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data, demo: false });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = projectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid project payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      {
        project: {
          id: crypto.randomUUID(),
          title: parsed.data.title,
          status: "draft",
        },
        message: "Project scaffold created. Connect Supabase persistence next.",
      },
      { status: 201 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      status: "draft",
    })
    .select("id, title, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data }, { status: 201 });
}
