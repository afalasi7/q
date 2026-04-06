import Link from "next/link";

interface EmptyProjectsStateProps {
  isAuthenticated: boolean;
}

export function EmptyProjectsState({ isAuthenticated }: EmptyProjectsStateProps) {
  if (!isAuthenticated) {
    return (
      <div className="mt-10 rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/70">
        <h2 className="text-xl font-semibold text-white">Login to see your projects</h2>
        <p className="mt-3 max-w-xl text-sm leading-6">
          Supabase is configured, but there is no active session in this browser yet.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/login" className="rounded-full bg-white px-5 py-3 font-semibold text-black">
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-white/10 px-5 py-3 font-semibold text-white"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-[2rem] border border-dashed border-white/15 bg-white/[0.03] p-8 text-white/70">
      <h2 className="text-xl font-semibold text-white">No projects yet</h2>
      <p className="mt-3 max-w-xl text-sm leading-6">
        Create your first project to start the upload and export flow.
      </p>
    </div>
  );
}
