"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Globe, Route } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { EndpointRow } from "@/components/dashboard/EndpointRow";
import { CopyButton } from "@/components/dashboard/CopyButton";
import { CreateEndpointModal } from "@/components/dashboard/CreateEndpointModal";

interface ProjectDetailContentProps {
  project: {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    endpoints: {
      id: string;
      method: string;
      path: string;
      statusCode: number;
      delay: number;
      isActive: boolean;
      headers: Record<string, string>;
      body: unknown;
      createdAt: string;
      updatedAt: string;
    }[];
  };
}

export function ProjectDetailContent({ project }: ProjectDetailContentProps) {
  const [showModal, setShowModal] = useState(false);

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/mock/${project.slug}`
      : `/api/mock/${project.slug}`;

  return (
    <>
      {/* Base URL */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-md border border-[#E5E1D8] bg-white px-3 py-1.5">
          <Globe className="h-3.5 w-3.5 text-[#9C9789]" />
          <code className="font-[family-name:var(--font-mono)] text-xs text-[#1A1A1A]">
            {baseUrl}
          </code>
        </div>
        <CopyButton text={baseUrl} label="Copy URL" />
      </div>

      {/* Endpoints Section */}
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-mono)] text-lg font-semibold text-[#1A1A1A]">
          Endpoints
        </h2>
        <Button onClick={() => setShowModal(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Endpoint
        </Button>
      </div>

      {/* Endpoints list */}
      {project.endpoints.length === 0 ? (
        <EmptyState
          icon={<Route className="h-7 w-7" />}
          title="No endpoints yet"
          description="Create your first endpoint to start building your mock API."
          action={
            <Button onClick={() => setShowModal(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Endpoint
            </Button>
          }
        />
      ) : (
        <div className="mt-4 overflow-hidden rounded-lg border border-[#E5E1D8] bg-white">
          {project.endpoints.map((endpoint, i) => (
            <EndpointRow
              key={endpoint.id}
              endpoint={endpoint}
              projectId={project.id}
              index={i}
            />
          ))}
        </div>
      )}

      <CreateEndpointModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        projectId={project.id}
      />
    </>
  );
}
