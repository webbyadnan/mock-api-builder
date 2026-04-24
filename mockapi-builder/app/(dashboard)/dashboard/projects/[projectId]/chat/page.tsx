import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ProjectChat } from "@/components/dashboard/ProjectChat";

interface ChatPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
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
      endpoints: {
        select: { id: true, method: true, path: true },
        where: { isActive: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!project) notFound();

  return (
    <div className="rounded-lg border border-[#E5E1D8] bg-white" style={{ height: "calc(100vh - 320px)", minHeight: "400px" }}>
      <ProjectChat
        projectId={projectId}
        endpoints={project.endpoints}
      />
    </div>
  );
}
