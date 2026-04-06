import type { CaptionSegment, ProjectRecord } from "@/types";

export const demoProjects: ProjectRecord[] = [
  {
    id: "demo-project-1",
    title: "Dubai Marina Walkthrough",
    status: "draft",
    durationSeconds: 28,
    originalVideoPath: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    exportedVideoPath: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-project-2",
    title: "Ramadan Coffee Reel",
    status: "done",
    durationSeconds: 42,
    originalVideoPath: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    exportedVideoPath: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const demoCaptions: CaptionSegment[] = [
  { start: 0, end: 2.8, text: "Welcome back to the edit." },
  { start: 2.9, end: 5.2, text: "This clip is ready for captions and export." },
  { start: 5.3, end: 8.4, text: "Phase one focuses on upload, templates, and output." },
];
