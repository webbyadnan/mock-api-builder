"use client";

import { useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  height?: string;
}

export function JsonEditor({
  value,
  onChange,
  error,
  height = "300px",
}: JsonEditorProps) {
  const handleMount = useCallback(
    (editor: { getAction: (id: string) => { run: () => void } | null }) => {
      // Auto-format on mount
      setTimeout(() => {
        const formatAction = editor.getAction("editor.action.formatDocument");
        if (formatAction) formatAction.run();
      }, 300);
    },
    [],
  );

  const options = useMemo(
    () => ({
      minimap: { enabled: false },
      wordWrap: "on" as const,
      lineNumbers: "on" as const,
      scrollBeyondLastLine: false,
      fontSize: 13,
      fontFamily: "'IBM Plex Mono', monospace",
      tabSize: 2,
      automaticLayout: true,
      formatOnPaste: true,
      formatOnType: true,
      renderLineHighlight: "line" as const,
      padding: { top: 12, bottom: 12 },
      scrollbar: {
        verticalScrollbarSize: 6,
        horizontalScrollbarSize: 6,
      },
    }),
    [],
  );

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#1A1A1A]">
        Response Body (JSON)
      </label>
      <div
        className={`overflow-hidden rounded-md border ${
          error ? "border-red-500" : "border-[#E5E1D8]"
        }`}
      >
        <Editor
          height={height}
          defaultLanguage="json"
          value={value}
          onChange={(val) => onChange(val || "")}
          onMount={handleMount}
          theme="vs-dark"
          options={options}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
