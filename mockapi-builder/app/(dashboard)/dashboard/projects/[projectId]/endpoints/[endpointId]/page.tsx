import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EndpointForm } from "@/components/editor/EndpointForm";
import type { HttpMethod } from "@/types";

interface EndpointEditorPageProps {
  params: Promise<{ projectId: string; endpointId: string }>;
}

export default async function EndpointEditorPage({
  params,
}: EndpointEditorPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { projectId, endpointId } = await params;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { userId: session.user.id },
        { members: { some: { userId: session.user.id } } }
      ]
    },
  });

  if (!project) notFound();

  const endpoint = await prisma.endpoint.findUnique({
    where: { id: endpointId, projectId },
  });

  if (!endpoint) notFound();

  return (
    <div>
      {/* Back link */}
      <Link
        href={`/dashboard/projects/${projectId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#9C9789] transition-colors hover:text-[#1A1A1A]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {project.name}
      </Link>

      {/* Page header */}
      <div className="mb-6 flex items-center gap-3">
        <Badge method={endpoint.method as HttpMethod} />
        <h1 className="font-[family-name:var(--font-mono)] text-xl font-bold text-[#1A1A1A]">
          {endpoint.path}
        </h1>
      </div>

      {/* Editor */}
      <EndpointForm
        endpoint={{
          ...endpoint,
          headers: endpoint.headers as Record<string, string>,
          apiKeyRequired: endpoint.apiKeyRequired,
        }}
        projectId={projectId}
        projectSlug={project.slug}
        isOwner={project.userId === session.user.id}
      />
    </div>
  );
}
