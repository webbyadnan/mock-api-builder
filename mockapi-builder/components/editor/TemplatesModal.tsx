"use client";

import { useState } from "react";
import { Layers, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { RESPONSE_TEMPLATES, TEMPLATE_CATEGORIES, type ResponseTemplate } from "@/lib/templates";
import type { HttpMethod } from "@/types";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: ResponseTemplate) => void;
}

const STATUS_COLOR: Record<number, string> = {
  200: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  201: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  401: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  404: "text-red-400 bg-red-400/10 border-red-400/20",
  500: "text-red-400 bg-red-400/10 border-red-400/20",
};

export function TemplatesModal({ isOpen, onClose, onSelect }: TemplatesModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered =
    activeCategory === "all"
      ? RESPONSE_TEMPLATES
      : RESPONSE_TEMPLATES.filter((t) => t.category === activeCategory);

  const handleSelect = (template: ResponseTemplate) => {
    setSelectedId(template.id);
    setTimeout(() => {
      onSelect(template);
      onClose();
      setSelectedId(null);
    }, 150);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Response Templates">
      <div className="space-y-4">
        <p className="text-sm text-[#9C9789]">
          One-click presets to fill your endpoint body, path, and status code.
        </p>

        {/* Category tabs */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded px-3 py-1 font-[family-name:var(--font-mono)] text-xs font-medium transition-colors ${
              activeCategory === "all"
                ? "bg-[#1A1A1A] text-white"
                : "text-[#9C9789] hover:text-[#1A1A1A]"
            }`}
          >
            All
          </button>
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded px-3 py-1 font-[family-name:var(--font-mono)] text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-[#1A1A1A] text-white"
                  : "text-[#9C9789] hover:text-[#1A1A1A]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 gap-2 max-h-[420px] overflow-y-auto pr-1">
          {filtered.map((template) => {
            const isSelected = selectedId === template.id;
            const statusColor =
              STATUS_COLOR[template.statusCode] ?? "text-[#9C9789] bg-[#F9F8F6] border-[#E5E1D8]";

            return (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                className={`group w-full rounded-lg border p-3.5 text-left transition-all ${
                  isSelected
                    ? "border-[#1A1A1A] bg-[#F0EDE6]"
                    : "border-[#E5E1D8] bg-white hover:border-[#C8C4BB] hover:bg-[#F9F8F6]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge method={template.method as HttpMethod} />
                    <span className="font-[family-name:var(--font-mono)] text-sm text-[#1A1A1A] truncate">
                      {template.path}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded border px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] font-bold ${statusColor}`}
                    >
                      {template.statusCode}
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-sm font-medium text-[#1A1A1A]">{template.name}</span>
                </div>
                <p className="mt-0.5 text-xs text-[#9C9789]">{template.description}</p>
                {/* JSON preview */}
                <pre className="mt-2.5 overflow-hidden rounded bg-[#F0EDE6] p-2 font-[family-name:var(--font-mono)] text-[10px] leading-4 text-[#555] max-h-16 group-hover:max-h-none transition-all">
                  {JSON.stringify(template.body, null, 2).slice(0, 180)}
                  {JSON.stringify(template.body, null, 2).length > 180 ? "…" : ""}
                </pre>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
