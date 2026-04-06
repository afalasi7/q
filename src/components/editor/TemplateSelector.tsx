"use client";

import { templates } from "@/lib/templates";
import type { TemplateConfig } from "@/types";

interface TemplateSelectorProps {
  selected: TemplateConfig | null;
  onSelect: (template: TemplateConfig) => void;
}

export function TemplateSelector({ selected, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-3 p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/45">Templates</p>
        <h2 className="mt-2 text-lg font-semibold text-white">Choose a preset</h2>
      </div>

      {templates.map((template) => {
        const isActive = selected?.id === template.id;

        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className={`w-full rounded-3xl border p-4 text-left transition ${
              isActive
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/8"
            }`}
          >
            <div
              className={`mb-3 h-24 rounded-2xl bg-gradient-to-br ${template.accent} opacity-90`}
            />
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{template.name}</h3>
                <p className={`mt-1 text-sm ${isActive ? "text-black/70" : "text-white/60"}`}>
                  {template.description}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs ${
                  isActive ? "bg-black/10 text-black/80" : "bg-white/8 text-white/65"
                }`}
              >
                {template.category}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
