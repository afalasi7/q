import { notFound } from "next/navigation";
import { EditorShell } from "@/components/editor/EditorShell";
import { getProjectById } from "@/lib/projects";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params;
  const { project, captions, isDemo } = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return <EditorShell project={project} initialCaptions={captions} isDemo={isDemo} />;
}
