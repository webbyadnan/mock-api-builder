"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import { JsonEditor } from "@/components/editor/JsonEditor";
import { EndpointTester } from "@/components/editor/EndpointTester";
import { Modal } from "@/components/ui/Modal";
import { isValidJson, formatJson } from "@/lib/utils";
import { HTTP_METHODS, STATUS_CODES } from "@/types";

interface EndpointFormProps {
  endpoint: {
    id: string;
    method: string;
    path: string;
    statusCode: number;
    delay: number;
    isActive: boolean;
    headers: Record<string, string>;
    body: unknown;
  };
  projectId: string;
  projectSlug: string;
}

export function EndpointForm({
  endpoint,
  projectId,
  projectSlug,
}: EndpointFormProps) {
  const [method, setMethod] = useState(endpoint.method);
  const [path, setPath] = useState(endpoint.path);
  const [statusCode, setStatusCode] = useState(endpoint.statusCode);
  const [delay, setDelay] = useState(endpoint.delay);
  const [body, setBody] = useState(
    typeof endpoint.body === "string"
      ? endpoint.body
      : JSON.stringify(endpoint.body, null, 2),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [jsonError, setJsonError] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const router = useRouter();
  const { addToast } = useToast();

  const mockUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/mock/${projectSlug}${path}`
      : `/api/mock/${projectSlug}${path}`;

  // Track unsaved changes
  useEffect(() => {
    const original = JSON.stringify({
      method: endpoint.method,
      path: endpoint.path,
      statusCode: endpoint.statusCode,
      delay: endpoint.delay,
      body: typeof endpoint.body === "string"
        ? endpoint.body
        : JSON.stringify(endpoint.body, null, 2),
    });
    const current = JSON.stringify({ method, path, statusCode, delay, body });
    setHasUnsavedChanges(original !== current);
  }, [method, path, statusCode, delay, body, endpoint]);

  // Validate JSON on body change
  useEffect(() => {
    if (body.trim() === "") {
      setJsonError("");
      return;
    }
    setJsonError(isValidJson(body) ? "" : "Invalid JSON");
  }, [body]);

  const handleSave = async () => {
    if (!isValidJson(body) && body.trim() !== "") {
      addToast({ type: "error", title: "Fix JSON errors before saving" });
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/endpoints/${endpoint.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method,
            path,
            statusCode,
            delay,
            body: body.trim() ? JSON.parse(body) : {},
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        addToast({ type: "error", title: data.error || "Failed to save" });
        return;
      }

      addToast({ type: "success", title: "Endpoint saved!" });
      setHasUnsavedChanges(false);
      router.refresh();
    } catch {
      addToast({ type: "error", title: "Something went wrong" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${method} ${path}? This cannot be undone.`)) return;

    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/projects/${projectId}/endpoints/${endpoint.id}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        addToast({ type: "success", title: "Endpoint deleted" });
        router.push(`/dashboard/projects/${projectId}`);
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

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast({ type: "error", title: data.error || "Failed to generate JSON" });
        return;
      }

      setBody(JSON.stringify(data, null, 2));
      setShowAiModal(false);
      setAiPrompt("");
      addToast({ type: "success", title: "AI Generated successfully!" });
    } catch {
      addToast({ type: "error", title: "Something went wrong" });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleFormat = () => {
    if (isValidJson(body)) {
      setBody(formatJson(body));
    }
  };

  return (
    <div className="space-y-6">
      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          You have unsaved changes
        </div>
      )}

      {/* Method + Path */}
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
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/users, /products/:id"
          />
        </div>
      </div>

      {/* Status + Delay */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Select
            label="Status Code"
            value={statusCode}
            onChange={(e) => setStatusCode(Number(e.target.value))}
            options={STATUS_CODES}
          />
        </div>
        <div className="flex-1">
          <Input
            label="Delay (ms)"
            type="number"
            min={0}
            max={10000}
            step={100}
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            helperText="0-10000ms. Simulates network latency."
          />
        </div>
      </div>

      {/* JSON Editor */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setShowAiModal(true)}
              className="flex items-center gap-1.5 text-xs text-[#F59E0B] transition-colors hover:text-[#EAB308]"
            >
              <Wand2 className="h-3 w-3" />
              Generate with AI
            </button>
          </div>
          <button
            onClick={handleFormat}
            className="text-xs text-[#9C9789] transition-colors hover:text-[#1A1A1A]"
          >
            Format JSON
          </button>
        </div>
        <JsonEditor
          value={body}
          onChange={setBody}
          error={jsonError}
          height="280px"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-[#E5E1D8] pt-4">
        <Button
          onClick={handleDelete}
          variant="danger"
          size="sm"
          isLoading={isDeleting}
          className="gap-2"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Endpoint
        </Button>
        <Button
          onClick={handleSave}
          isLoading={isSaving}
          disabled={!!jsonError}
          className="gap-2"
        >
          <Save className="h-3.5 w-3.5" />
          Save Changes
        </Button>
      </div>

      {/* Tester */}
      <EndpointTester url={mockUrl} method={method} />

      {/* AI Modal */}
      <Modal isOpen={showAiModal} onClose={() => setShowAiModal(false)} title="Generate Mock Data with AI">
        <div className="space-y-4">
          <p className="text-sm text-[#9C9789]">
            Describe the JSON structure you need. For example: "A list of 3 users with id, name, and email".
          </p>
          <Input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe your desired JSON..."
            autoFocus
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAiModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAiGenerate} isLoading={isGeneratingAi} className="gap-2">
              <Wand2 className="h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
