export type ProjectStatus = "draft" | "processing" | "done" | "failed";

export interface CaptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface TemplateConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  aspectRatio: string;
  resolution: string;
  maxDuration: number;
  accent: string;
  premium?: boolean;
  captions: {
    enabled: boolean;
    language: "auto" | "en" | "ar";
    rtl: boolean;
  };
  music: {
    enabled: boolean;
    track: string | null;
  };
  filters: Array<{ type: "vibrance" | "contrast"; value: number }>;
}

export interface ProjectRecord {
  id: string;
  title: string;
  status: ProjectStatus;
  durationSeconds: number;
  thumbnailPath?: string | null;
  thumbnailUrl?: string | null;
  originalVideoPath: string | null;
  originalVideoUrl?: string | null;
  exportedVideoPath: string | null;
  exportedVideoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobRecord {
  id: string;
  projectId: string;
  status: "pending" | "processing" | "done" | "failed";
  progress: number;
  result?: Record<string, unknown>;
  errorMessage?: string | null;
}
