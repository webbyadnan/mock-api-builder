"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";
import type { HttpMethod } from "@/types";

interface EndpointRowProps {
  endpoint: {
    id: string;
    method: string;
    path: string;
    statusCode: number;
    delay: number;
    isActive: boolean;
  };
  projectId: string;
  index: number;
}

export function EndpointRow({ endpoint, projectId, index }: EndpointRowProps) {
  const [isActive, setIsActive] = useState(endpoint.isActive);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newState = !isActive;
    setIsActive(newState);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/endpoints/${endpoint.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: newState }),
        },
      );

      if (!res.ok) {
        setIsActive(!newState);
        addToast({ type: "error", title: "Failed to toggle endpoint" });
      }
    } catch {
      setIsActive(!newState);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Delete ${endpoint.method} ${endpoint.path}?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/endpoints/${endpoint.id}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        addToast({ type: "success", title: "Endpoint deleted" });
        router.refresh();
      } else {
        addToast({ type: "error", title: "Failed to delete" });
      }
    } catch {
      addToast({ type: "error", title: "Something went wrong" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Link
      href={`/dashboard/projects/${projectId}/endpoints/${endpoint.id}`}
      className={`animate-slide-in-left stagger-${Math.min(index + 1, 8)} group flex items-center gap-4 border-b border-[#E5E1D8] px-4 py-3 transition-colors hover:bg-[#F0EDE6] last:border-b-0`}
    >
      {/* Method badge */}
      <Badge method={endpoint.method as HttpMethod} />

      {/* Path */}
      <span className="flex-1 font-[family-name:var(--font-mono)] text-sm text-[#1A1A1A]">
        {endpoint.path}
      </span>

      {/* Status code */}
      <span className="animate-pulse-once font-[family-name:var(--font-mono)] text-xs text-[#9C9789]">
        {endpoint.statusCode}
      </span>

      {/* Delay */}
      {endpoint.delay > 0 && (
        <span className="font-[family-name:var(--font-mono)] text-xs text-[#9C9789]">
          {endpoint.delay}ms
        </span>
      )}

      {/* Toggle */}
      <button
        onClick={handleToggle}
        className="text-[#9C9789] transition-colors hover:text-[#1A1A1A]"
        title={isActive ? "Disable endpoint" : "Enable endpoint"}
      >
        {isActive ? (
          <ToggleRight className="h-5 w-5 text-emerald-600" />
        ) : (
          <ToggleLeft className="h-5 w-5" />
        )}
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-md p-1 text-[#9C9789] opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </Link>
  );
}
