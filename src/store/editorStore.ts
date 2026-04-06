import { create } from "zustand";
import type { CaptionSegment, TemplateConfig } from "@/types";

interface EditorState {
  selectedTemplate: TemplateConfig | null;
  captions: CaptionSegment[];
  progress: number;
  setTemplate: (template: TemplateConfig) => void;
  setCaptions: (captions: CaptionSegment[]) => void;
  setProgress: (progress: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedTemplate: null,
  captions: [],
  progress: 0,
  setTemplate: (selectedTemplate) => set({ selectedTemplate }),
  setCaptions: (captions) => set({ captions }),
  setProgress: (progress) => set({ progress }),
}));
