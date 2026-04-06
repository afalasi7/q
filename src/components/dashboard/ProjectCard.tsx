import Link from "next/link";
import type { ProjectRecord } from "@/types";

interface ProjectCardProps {
  project: ProjectRecord;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/editor/${project.id}`}
      className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/8"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
            {project.status}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{project.title}</h3>
        </div>
        <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/70">
          {Math.round(project.durationSeconds)}s
        </span>
      </div>
      <div className="aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent">
        {project.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.thumbnailUrl} alt={project.title} className="h-full w-full object-cover" />
        ) : project.originalVideoUrl ? (
          <video src={project.originalVideoUrl} className="h-full w-full object-cover" muted playsInline />
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-white/55">
        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
        <span>Open editor</span>
      </div>
    </Link>
  );
}
