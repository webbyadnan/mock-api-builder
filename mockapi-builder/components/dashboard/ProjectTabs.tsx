"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Route, Activity, Users, MessageCircle, TrendingUp } from "lucide-react";

export function ProjectTabs({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Endpoints", href: `/dashboard/projects/${projectId}`, icon: Route },
    { name: "Logs", href: `/dashboard/projects/${projectId}/logs`, icon: Activity },
    { name: "Analytics", href: `/dashboard/projects/${projectId}/analytics`, icon: TrendingUp },
    { name: "Chat", href: `/dashboard/projects/${projectId}/chat`, icon: MessageCircle },
    { name: "Team", href: `/dashboard/projects/${projectId}/settings`, icon: Users },
  ];

  return (
    <div className="flex border-b border-[#E5E1D8]">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-[family-name:var(--font-mono)] text-sm font-medium transition-colors ${
              isActive
                ? "border-[#1A1A1A] text-[#1A1A1A]"
                : "border-transparent text-[#9C9789] hover:text-[#1A1A1A]"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
