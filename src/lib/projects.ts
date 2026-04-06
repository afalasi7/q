import { demoCaptions, demoProjects } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CaptionSegment, ProjectRecord } from "@/types";

type CaptionRow = {
  segments: CaptionSegment[] | null;
};

type ProjectRow = {
  id: string;
  title: string;
  status: ProjectRecord["status"];
  duration_seconds: number | null;
  thumbnail_path: string | null;
  original_video_path: string | null;
  exported_video_path: string | null;
  created_at: string;
  updated_at: string;
};

function mapProject(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    durationSeconds: row.duration_seconds ?? 0,
    thumbnailPath: row.thumbnail_path,
    originalVideoPath: row.original_video_path,
    exportedVideoPath: row.exported_video_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function createThumbnailUrl(path: string | null) {
  if (!path) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data } = supabase.storage.from("thumbnails").getPublicUrl(path);
  return data.publicUrl;
}

async function createSignedUrl(path: string | null) {
  if (!path) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.storage.from("videos").createSignedUrl(path, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

async function createExportSignedUrl(path: string | null) {
  if (!path) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.storage.from("exports").createSignedUrl(path, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}

export async function getDashboardProjects() {
  if (!hasSupabaseEnv()) {
    return { projects: demoProjects, user: null, isDemo: true };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { projects: [], user: null, isDemo: false };
  }

  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, status, duration_seconds, thumbnail_path, original_video_path, exported_video_path, created_at, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return {
    projects: await Promise.all(
      ((data ?? []) as ProjectRow[]).map(async (row) => {
        const project = mapProject(row);

        return {
          ...project,
          thumbnailUrl: await createThumbnailUrl(project.thumbnailPath ?? null),
          originalVideoUrl: await createSignedUrl(project.originalVideoPath),
          exportedVideoUrl: await createExportSignedUrl(project.exportedVideoPath),
        };
      }),
    ),
    user,
    isDemo: false,
  };
}

export async function getProjectById(projectId: string) {
  if (!hasSupabaseEnv()) {
    return {
      project: demoProjects.find((item) => item.id === projectId) ?? demoProjects[0],
      captions: demoCaptions,
      isDemo: true,
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { project: null, captions: [], isDemo: false };
  }

  const [{ data: projectRow, error: projectError }, { data: captionRows, error: captionsError }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, title, status, duration_seconds, thumbnail_path, original_video_path, exported_video_path, created_at, updated_at",
        )
        .eq("id", projectId)
        .single(),
      supabase.from("captions").select("segments").eq("project_id", projectId).limit(1),
    ]);

  if (projectError) {
    if (projectError.code === "PGRST116") {
      return { project: null, captions: [], isDemo: false };
    }

    throw projectError;
  }

  if (captionsError) {
    throw captionsError;
  }

  const captionRow = (captionRows?.[0] ?? null) as CaptionRow | null;

  return {
    project: {
      ...mapProject(projectRow as ProjectRow),
      thumbnailUrl: await createThumbnailUrl((projectRow as ProjectRow).thumbnail_path),
      originalVideoUrl: await createSignedUrl((projectRow as ProjectRow).original_video_path),
      exportedVideoUrl: await createExportSignedUrl((projectRow as ProjectRow).exported_video_path),
    },
    captions: captionRow?.segments ?? [],
    isDemo: false,
  };
}
