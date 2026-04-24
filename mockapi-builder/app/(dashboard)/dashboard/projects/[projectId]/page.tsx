import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ProjectDetailContent } from "./ProjectDetailContent";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { projectId } = await params;

  const project = await prisma.project.findFirst({
    where: { 
      id: projectId,
      OR: [
        { userId: session.user.id },
        { members: { some: { userId: session.user.id } } }
      ]
    },
    include: {
      endpoints: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) notFound();

  return (
    <ProjectDetailContent
      project={{
        ...project,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        endpoints: project.endpoints.map((ep) => ({
          ...ep,
          headers: ep.headers as Record<string, string>,
          body: ep.body,
          createdAt: ep.createdAt.toISOString(),
          updatedAt: ep.updatedAt.toISOString(),
        })),
      }}
    />
  );
}
