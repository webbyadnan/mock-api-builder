"use client";

import { useState } from "react";
import { Plus, FolderPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { TeamProjectCard } from "@/components/dashboard/TeamProjectCard";
import { CreateProjectModal } from "@/components/dashboard/CreateProjectModal";

interface Project {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count: { endpoints: number; members: number };
  endpoints: { method: string }[];
}

interface TeamProject extends Project {
  user: { name: string | null; email: string; image: string | null };
  members: {
    role: string;
    user: { name: string | null; image: string | null };
  }[];
}

interface DashboardContentProps {
  myProjects: Project[];
  teamProjects: TeamProject[];
}

export function DashboardContent({
  myProjects,
  teamProjects,
}: DashboardContentProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* ─── My Projects ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-mono)] text-2xl font-bold text-[#1A1A1A]">
              My Projects
            </h1>
            <p className="mt-0.5 text-sm text-[#9C9789]">
              Your personal API collections
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="mt-6">
          {myProjects.length === 0 ? (
            <EmptyState
              icon={<FolderPlus className="h-7 w-7" />}
              title="No projects yet"
              description="Create your first project to start building mock API endpoints."
              action={
                <Button onClick={() => setShowModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Project
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myProjects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Team Projects ───────────────────────────────── */}
      <section id="team" className="mt-12 scroll-mt-8">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-mono)] text-2xl font-bold text-[#1A1A1A]">
              Team Projects
            </h2>
            <p className="mt-0.5 text-sm text-[#9C9789]">
              APIs you are collaborating on with others
            </p>
          </div>
          {teamProjects.length > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7C3AED]/10 px-1.5 text-[11px] font-semibold text-[#7C3AED]">
              {teamProjects.length}
            </span>
          )}
        </div>

        <div className="mt-6">
          {teamProjects.length === 0 ? (
            <EmptyState
              icon={<Users className="h-7 w-7" />}
              title="No team projects"
              description="When someone invites you to a project, it will appear here."
              className="py-10"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teamProjects.map((project, i) => (
                <TeamProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CreateProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
