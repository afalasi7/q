import { NextResponse } from "next/server";
import { demoProjects } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: RouteProps) {
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    const project = demoProjects.find((item) => item.id === id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project, demo: true });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, status, duration_seconds, original_video_path, exported_video_path, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ project: data, demo: false });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ id, body, message: "PATCH route scaffolded for Supabase." });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .update(body)
    .eq("id", id)
    .select("id, title, status, duration_seconds, original_video_path, exported_video_path, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}

export async function DELETE(_: Request, { params }: RouteProps) {
  const { id } = await params;

  if (!hasSupabaseEnv()) {
    return NextResponse.json({ id, message: "DELETE route scaffolded for Supabase." });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
