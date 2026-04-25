"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Layers } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { TemplatesModal } from "@/components/editor/TemplatesModal";
import { HTTP_METHODS, STATUS_CODES } from "@/types";
import type { ResponseTemplate } from "@/lib/templates";

interface CreateEndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function CreateEndpointModal({
  isOpen,
  onClose,
  projectId,
}: CreateEndpointModalProps) {
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("");
  const [statusCode, setStatusCode] = useState(200);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleTemplateSelect = (template: ResponseTemplate) => {
    setMethod(template.method);
    setPath(template.path);
    setStatusCode(template.statusCode);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!path.trim()) {
      setError("Path is required");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/endpoints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          path: path.trim(),
          statusCode,
          body: { message: "Mock response" },
          delay: 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create endpoint");
        return;
      }

      addToast({
        type: "success",
        title: "Endpoint created!",
        description: `${method} ${path.trim()}`,
      });
      setPath("");
      setMethod("GET");
      setStatusCode(200);
      onClose();
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="New Endpoint" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template shortcut */}
          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            className="flex w-full items-center gap-2 rounded-md border border-dashed border-[#C8C4BB] px-3 py-2.5 text-sm text-[#9C9789] transition-colors hover:border-[#6366F1] hover:bg-[#F5F5FF] hover:text-[#6366F1]"
          >
            <Layers className="h-4 w-4" />
            <span className="font-[family-name:var(--font-mono)]">Start from a template</span>
            <span className="ml-auto text-xs opacity-60">8 presets →</span>
          </button>

          <div className="flex gap-3">
            <div className="w-32">
              <Select
                label="Method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                options={HTTP_METHODS.map((m) => ({ value: m, label: m }))}
              />
            </div>
            <div className="flex-1">
              <Input
                label="Path"
                placeholder="/users, /products/:id"
                value={path}
                onChange={(e) => {
                  setPath(e.target.value);
                  setError("");
                }}
                error={error}
                autoFocus
              />
            </div>
          </div>

          <Select
            label="Status Code"
            value={statusCode}
            onChange={(e) => setStatusCode(Number(e.target.value))}
            options={STATUS_CODES}
          />

          <p className="text-xs text-[#9C9789]">
            You can customize the response body and headers after creating the endpoint.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Create Endpoint
            </Button>
          </div>
        </form>
      </Modal>

      <TemplatesModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={(template: ResponseTemplate) => {
          handleTemplateSelect(template);
          setShowTemplates(false);
        }}
      />
    </>
  );
}
