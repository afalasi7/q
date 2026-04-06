import Link from "next/link";

const highlights = [
  "Upload a source clip and create a project in one step.",
  "Apply vertical templates for Reels, TikTok, and Shorts.",
  "Prepare the pipeline for captions, music, and FFmpeg export jobs.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_25%),#09090b] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">q</p>
            <h1 className="mt-2 text-2xl font-semibold">AI video editor MVP</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-white/70 transition hover:text-white">
              Login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-white px-4 py-2 font-semibold text-black transition hover:bg-white/90"
            >
              Open dashboard
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-amber-300">
              Built for short-form creators in the Gulf
            </p>
            <h2 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
              Template-first editing with an AI-ready export pipeline.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
              This first build sets up upload, dashboard, editor, worker, and deploy-ready
              infrastructure so the real Supabase and FFmpeg integrations can drop in cleanly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90"
              >
                View MVP
              </Link>
              <Link
                href="/templates"
                className="rounded-full border border-white/15 px-5 py-3 font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
              >
                Browse templates
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/40">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/40 p-5">
              <div className="flex items-center justify-between text-sm text-white/55">
                <span>Phase 1</span>
                <span>Upload -&gt; Template -&gt; Export</span>
              </div>
              <div className="mt-6 grid gap-3">
                {highlights.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
