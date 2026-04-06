import { templates } from "@/lib/templates";

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white lg:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Templates</p>
        <h1 className="mt-3 text-4xl font-semibold">Template library</h1>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <article
              key={template.id}
              className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5"
            >
              <div className={`h-44 rounded-[1.5rem] bg-gradient-to-br ${template.accent}`} />
              <h2 className="mt-4 text-xl font-semibold">{template.name}</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">{template.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-white/45">
                <span>{template.category}</span>
                <span>{template.resolution}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
