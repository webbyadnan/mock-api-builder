import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ProjectTabs } from "@/components/dashboard/ProjectTabs";

interface ProjectLayoutProps {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
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
  });

  if (!project) notFound();

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[#9C9789] transition-colors hover:text-[#1A1A1A]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Projects
      </Link>

      {/* Project Header */}
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-mono)] text-2xl font-bold text-[#1A1A1A]">
          {project.name}
        </h1>
      </div>

      <ProjectTabs projectId={projectId} />

      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}
