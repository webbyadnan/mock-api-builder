"use client";

import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { HttpMethod } from "@/types";

interface TeamProjectCardProps {
  project: {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    _count: { endpoints: number; members: number };
    endpoints: { method: string }[];
    user: { name: string | null; email: string; image: string | null };
    members: {
      role: string;
      user: { name: string | null; image: string | null };
    }[];
  };
  index: number;
}

export function TeamProjectCard({ project, index }: TeamProjectCardProps) {
  const uniqueMethods = [
    ...new Set(project.endpoints.map((ep) => ep.method)),
  ];

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className={`animate-fade-in-up stagger-${Math.min(index + 1, 8)} group relative block rounded-lg border border-[#E5E1D8] bg-white p-5 transition-all duration-200 hover:border-[#7C3AED]/40 hover:shadow-[0_0_0_1px_rgba(124,58,237,0.1)]`}
    >
      {/* Team indicator */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7C3AED]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#7C3AED]">
          <Users className="h-3 w-3" />
          Team
        </span>
        <span className="text-[10px] text-[#9C9789]">
          {project._count.members + 1} member
          {project._count.members + 1 !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Project name */}
      <h3 className="font-[family-name:var(--font-mono)] text-base font-semibold text-[#1A1A1A]">
        {project.name}
      </h3>

      {/* Slug */}
      <p className="mt-1 font-[family-name:var(--font-mono)] text-xs text-[#9C9789]">
        /{project.slug}
      </p>

      {/* Owner info */}
      <div className="mt-2 flex items-center gap-2">
        {project.user.image ? (
          <img
            src={project.user.image}
            alt=""
            className="h-4 w-4 rounded-full"
          />
        ) : (
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] text-[8px] font-bold text-white">
            {project.user.name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
        <span className="text-[11px] text-[#9C9789]">
          Owned by{" "}
          <span className="font-medium text-[#6B6860]">
            {project.user.name || project.user.email}
          </span>
        </span>
      </div>

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

      {/* Member avatars */}
      <div className="mt-3 flex items-center gap-1">
        {project.members.slice(0, 4).map((member, i) =>
          member.user.image ? (
            <img
              key={i}
              src={member.user.image}
              alt=""
              className="h-5 w-5 rounded-full border border-white"
            />
          ) : (
            <div
              key={i}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#E5E1D8] text-[8px] font-bold text-[#6B6860]"
            >
              {member.user.name?.[0]?.toUpperCase() || "?"}
            </div>
          )
        )}
        {project._count.members > 4 && (
          <span className="ml-1 text-[10px] text-[#9C9789]">
            +{project._count.members - 4}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-[#E5E1D8] pt-3">
        <span className="text-xs text-[#9C9789]">
          {project._count.endpoints} endpoint
          {project._count.endpoints !== 1 ? "s" : ""}
          {" · "}
          {formatDate(project.updatedAt)}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-[#9C9789] transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
