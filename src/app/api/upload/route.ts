import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function sanitizeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const thumbnail = formData.get("thumbnail");
  const title = String(formData.get("title") ?? "Untitled Project").trim() || "Untitled Project";
  const durationSeconds = Number(formData.get("durationSeconds") ?? 0);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing video file." }, { status: 400 });
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      {
        error: "Supabase environment variables are required before uploads can be enabled.",
      },
      { status: 503 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      title,
      status: "draft",
    })
    .select("id")
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: projectError?.message ?? "Unable to create project." }, { status: 500 });
  }

  const extension = file.name.split(".").pop() || "mp4";
  const storagePath = `${user.id}/${project.id}/original.${sanitizeFileName(extension)}`;
  const { error: uploadError } = await supabase.storage.from("videos").upload(storagePath, file, {
    contentType: file.type || "video/mp4",
    upsert: false,
  });

  if (uploadError) {
    await supabase.from("projects").delete().eq("id", project.id);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  let thumbnailPath: string | null = null;

  if (thumbnail instanceof File) {
    thumbnailPath = `${user.id}/${project.id}/thumbnail.jpg`;
    const { error: thumbnailError } = await supabase.storage
      .from("thumbnails")
      .upload(thumbnailPath, thumbnail, {
        contentType: thumbnail.type || "image/jpeg",
        upsert: true,
      });

    if (thumbnailError) {
      return NextResponse.json({ error: thumbnailError.message }, { status: 500 });
    }
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      original_video_path: storagePath,
      thumbnail_path: thumbnailPath,
      duration_seconds: Number.isFinite(durationSeconds) ? durationSeconds : null,
    })
    .eq("id", project.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ projectId: project.id, path: storagePath }, { status: 201 });
}
