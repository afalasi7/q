import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { EmptyProjectsState } from "@/components/dashboard/EmptyProjectsState";
import { NewProjectButton } from "@/components/dashboard/NewProjectButton";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { UploadVideoButton } from "@/components/dashboard/UploadVideoButton";
import { getDashboardProjects } from "@/lib/projects";

export default async function DashboardPage() {
  const { projects, user, isDemo } = await getDashboardProjects();

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold">Your projects</h1>
            <p className="mt-3 max-w-2xl text-white/60">
              {isDemo
                ? "Supabase env is missing, so the dashboard is showing demo projects."
                : "Your live Supabase projects are shown here once you sign in."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user ? <LogoutButton /> : <Link href="/login" className="text-sm text-white/75">Login</Link>}
            <UploadVideoButton />
            <NewProjectButton />
          </div>
        </div>

        {projects.length === 0 ? (
          <EmptyProjectsState isAuthenticated={Boolean(user)} />
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
