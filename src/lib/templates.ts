import type { TemplateConfig } from "@/types";

export const templates: TemplateConfig[] = [
  {
    id: "dubai-reels",
    name: "Dubai Reels",
    category: "reels",
    description: "High-contrast vertical preset for city, lifestyle, and travel edits.",
    aspectRatio: "9:16",
    resolution: "1080x1920",
    maxDuration: 60,
    accent: "from-amber-300 to-orange-500",
    captions: { enabled: true, language: "auto", rtl: false },
    music: { enabled: true, track: "dubai_ambient_01" },
    filters: [
      { type: "vibrance", value: 1.2 },
      { type: "contrast", value: 1.08 },
    ],
  },
  {
    id: "ramadan-lights",
    name: "Ramadan Lights",
    category: "ramadan",
    description: "Warm gold styling tuned for food, family, and nightly Ramadan moments.",
    aspectRatio: "9:16",
    resolution: "1080x1920",
    maxDuration: 60,
    accent: "from-fuchsia-300 to-amber-300",
    captions: { enabled: true, language: "ar", rtl: true },
    music: { enabled: true, track: "oud_night_01" },
    filters: [
      { type: "vibrance", value: 1.16 },
      { type: "contrast", value: 1.04 },
    ],
  },
  {
    id: "shorts-clean",
    name: "Shorts Clean",
    category: "youtube_shorts",
    description: "Simple utility template for tutorials, talking head clips, and explainers.",
    aspectRatio: "9:16",
    resolution: "1080x1920",
    maxDuration: 90,
    accent: "from-cyan-300 to-blue-500",
    captions: { enabled: false, language: "auto", rtl: false },
    music: { enabled: false, track: null },
    filters: [{ type: "contrast", value: 1.02 }],
  },
];

export function getTemplateById(id: string | null | undefined) {
  return templates.find((template) => template.id === id) ?? templates[0];
}
