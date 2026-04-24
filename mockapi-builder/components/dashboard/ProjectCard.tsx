"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import type { HttpMethod } from "@/types";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    _count: { endpoints: number; members?: number };
    endpoints: { method: string }[];
  };
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const uniqueMethods = [...new Set(project.endpoints.map((ep) => ep.method))];

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Delete "${project.name}"? This will also delete all endpoints.`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (res.ok) {
        addToast({ type: "success", title: "Project deleted" });
        router.refresh();
      } else {
        addToast({ type: "error", title: "Failed to delete project" });
      }
    } catch {
      addToast({ type: "error", title: "Something went wrong" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className={`animate-fade-in-up stagger-${Math.min(index + 1, 8)} group relative block rounded-lg border border-[#E5E1D8] bg-white p-5 transition-all duration-200 hover:border-[#D5D0C6]`}
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute right-3 top-3 rounded-md p-1.5 text-[#9C9789] opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      {/* Project name */}
      <h3 className="font-[family-name:var(--font-mono)] text-base font-semibold text-[#1A1A1A]">
        {project.name}
      </h3>

      {/* Slug */}
      <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[#9C9789]">
        /{project.slug}
      </p>

      {/* Method badges */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {uniqueMethods.length > 0 ? (
          uniqueMethods.map((method) => (
            <Badge key={method} method={method as HttpMethod} size="sm" />
          ))
        ) : (
          <span className="text-xs text-[#9C9789]">No endpoints yet</span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[#E5E1D8] pt-3">
        <span className="text-xs text-[#9C9789]">
          {project._count.endpoints} endpoint{project._count.endpoints !== 1 ? "s" : ""}
          {" · "}
          {formatDate(project.updatedAt)}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-[#9C9789] transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
