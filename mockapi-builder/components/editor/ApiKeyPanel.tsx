"use client";

import { useState } from "react";
import { Key, Eye, EyeOff, Copy, RefreshCw, Trash2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface ApiKeyPanelProps {
  projectId: string;
  endpointId: string;
  apiKeyRequired: boolean;
  isOwner: boolean;
}

export function ApiKeyPanel({
  projectId,
  endpointId,
  apiKeyRequired,
  isOwner,
}: ApiKeyPanelProps) {
  const [isProtected, setIsProtected] = useState(apiKeyRequired);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  // New-key reveal modal
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [showReveal, setShowReveal] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const { addToast } = useToast();

  const handleGenerate = async () => {
    if (
      isProtected &&
      !confirm(
        "This will rotate the key and invalidate the old one. Continue?"
      )
    )
      return;

    setIsGenerating(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/endpoints/${endpointId}/api-key`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) {
        addToast({ type: "error", title: data.error || "Failed to generate key" });
        return;
      }
      setRevealedKey(data.data.key);
      setShowReveal(true);
      setIsProtected(true);
    } catch {
      addToast({ type: "error", title: "Something went wrong" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm("Remove API key protection from this endpoint?")) return;

    setIsRevoking(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/endpoints/${endpointId}/api-key`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        addToast({ type: "error", title: data.error || "Failed to revoke key" });
        return;
      }
      setIsProtected(false);
      addToast({ type: "success", title: "API key revoked — endpoint is now public" });
    } catch {
      addToast({ type: "error", title: "Something went wrong" });
    } finally {
      setIsRevoking(false);
    }
  };

  const copyKey = () => {
    if (!revealedKey) return;
    navigator.clipboard.writeText(revealedKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  if (!isOwner) {
    return (
      <div className="rounded-lg border border-[#E5E1D8] bg-[#F9F8F6] p-4">
        <div className="flex items-center gap-2 text-sm text-[#9C9789]">
          {isProtected ? (
            <>
              <Lock className="h-4 w-4 text-amber-500" />
              <span>This endpoint is protected with an API key. Only the project owner can manage it.</span>
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4 text-[#9C9789]" />
              <span>No API key protection. Only the project owner can enable it.</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-[#E5E1D8] bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-[#E5E1D8] bg-[#F9F8F6] px-4 py-3">
          <Key className="h-4 w-4 text-[#F59E0B]" />
          <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[#1A1A1A]">
            API Key Protection
          </span>
          <div className="ml-auto">
            {isProtected ? (
              <span className="flex items-center gap-1.5 rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                <Lock className="h-2.5 w-2.5" />
                PROTECTED
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded border border-[#E5E1D8] bg-white px-2 py-0.5 text-[10px] font-bold text-[#9C9789]">
                <Unlock className="h-2.5 w-2.5" />
                PUBLIC
              </span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {isProtected ? (
            <>
              <p className="text-xs text-[#9C9789]">
                Callers must send{" "}
                <code className="rounded bg-[#F0EDE6] px-1 py-0.5 font-[family-name:var(--font-mono)] text-[#1A1A1A]">
                  X-API-Key: sk_mock_••••••••
                </code>{" "}
                or{" "}
                <code className="rounded bg-[#F0EDE6] px-1 py-0.5 font-[family-name:var(--font-mono)] text-[#1A1A1A]">
                  ?api_key=…
                </code>{" "}
                to access this endpoint.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  size="sm"
                  variant="secondary"
                  className="gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Rotate Key
                </Button>
                <Button
                  onClick={handleRevoke}
                  isLoading={isRevoking}
                  size="sm"
                  variant="danger"
                  className="gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Revoke
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-[#9C9789]">
                This endpoint is publicly accessible. Generate an API key to restrict access.
              </p>
              <Button
                onClick={handleGenerate}
                isLoading={isGenerating}
                size="sm"
                className="gap-1.5"
              >
                <Key className="h-3.5 w-3.5" />
                Generate API Key
              </Button>
            </>
          )}
        </div>
      </div>

      {/* One-time key reveal modal */}
      <Modal
        isOpen={showReveal}
        onClose={() => setShowReveal(false)}
        title="Your New API Key"
      >
        <div className="space-y-4">
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            ⚠️ This key is shown <strong>only once</strong>. Copy it now and store it safely — you cannot retrieve it later.
          </div>

          <div className="relative rounded-md border border-[#E5E1D8] bg-[#0A0A0A] p-3">
            <code className="block overflow-x-auto font-[family-name:var(--font-mono)] text-sm text-[#34D399] select-all whitespace-nowrap">
              {revealedKey}
            </code>
          </div>

          <div className="text-xs text-[#9C9789] space-y-1">
            <p>Use it in your requests:</p>
            <code className="block rounded bg-[#F0EDE6] px-3 py-2 font-[family-name:var(--font-mono)] text-xs text-[#1A1A1A]">
              {"curl -H \"X-API-Key: " + revealedKey + "\" <your-endpoint-url>"}
            </code>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={copyKey}
              variant="secondary"
              className="gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              {keyCopied ? "Copied!" : "Copy Key"}
            </Button>
            <Button onClick={() => setShowReveal(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
