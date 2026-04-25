"use client";

import { useState, useRef } from "react";

const BASE_URL = "https://mockapi.adnanxdev.site/api/mock/demo";

interface DemoEndpoint {
  label: string;
  method: "GET" | "POST";
  path: string;
  description: string;
}

const ENDPOINTS: DemoEndpoint[] = [
  { label: "GET /users", method: "GET", path: "/users", description: "List of users" },
  { label: "GET /products", method: "GET", path: "/products", description: "Product catalog" },
  { label: "POST /auth/login", method: "POST", path: "/auth/login", description: "Auth response" },
];

const METHOD_COLOR: Record<string, string> = {
  GET: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  POST: "text-blue-400 border-blue-400/30 bg-blue-400/10",
};

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return `<span class="text-[#9CDCFE]">${match}</span>`;
          return `<span class="text-[#CE9178]">${match}</span>`;
        }
        if (/true|false/.test(match)) return `<span class="text-[#569CD6]">${match}</span>`;
        if (/null/.test(match)) return `<span class="text-[#569CD6]">${match}</span>`;
        return `<span class="text-[#B5CEA8]">${match}</span>`;
      }
    );
}

export function LiveDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animatedLines, setAnimatedLines] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const active = ENDPOINTS[activeIdx];

  const handleTry = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setResponse(null);
    setStatus(null);
    setElapsed(null);
    setAnimatedLines([]);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    const t0 = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${active.path}`, {
        method: active.method,
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
      });
      const t1 = performance.now();
      setElapsed(Math.round(t1 - t0));
      setStatus(res.status);

      const json = await res.json();
      const formatted = JSON.stringify(json, null, 2);
      setResponse(formatted);

      // Animate lines in one by one
      const lines = formatted.split("\n");
      lines.forEach((_, i) => {
        setTimeout(() => {
          setAnimatedLines((prev) => [...prev, lines[i]]);
        }, i * 30);
      });
    } catch (e: unknown) {
      if ((e as Error).name !== "AbortError") {
        setResponse(JSON.stringify({ error: "Request failed" }, null, 2));
        setStatus(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const statusColor =
    status !== null
      ? status >= 200 && status < 300
        ? "text-emerald-400"
        : "text-red-400"
      : "";

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#0A0A0A]">
      {/* Terminal top bar */}
      <div className="flex items-center gap-2 border-b border-[#1E1E1E] px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <span className="ml-2 font-[family-name:var(--font-mono)] text-[10px] text-[#444]">
          live demo — mockapi.adnanxdev.site
        </span>
        {status !== null && (
          <span className={`ml-auto font-[family-name:var(--font-mono)] text-[10px] font-bold ${statusColor}`}>
            {status} · {elapsed}ms
          </span>
        )}
      </div>

      {/* Endpoint selector */}
      <div className="flex gap-1 border-b border-[#1A1A1A] px-4 py-2">
        {ENDPOINTS.map((ep, i) => (
          <button
            key={ep.label}
            onClick={() => {
              setActiveIdx(i);
              setResponse(null);
              setStatus(null);
              setElapsed(null);
              setAnimatedLines([]);
            }}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-bold transition-all ${
              i === activeIdx
                ? "bg-[#1E1E1E] text-white"
                : "text-[#555] hover:text-[#888]"
            }`}
          >
            <span className={`rounded border px-1 py-0.5 text-[9px] ${METHOD_COLOR[ep.method]}`}>
              {ep.method}
            </span>
            {ep.path}
          </button>
        ))}
      </div>

      {/* Terminal body */}
      <div className="min-h-[260px] p-4 font-[family-name:var(--font-mono)] text-[12px] leading-5">
        {/* curl command line */}
        <div className="mb-3 flex items-start gap-2">
          <span className="text-[#F59E0B] select-none">$</span>
          <span className="text-[#888]">
            curl -X {active.method}{" "}
            <span className="text-[#E5E1D8]">
              {BASE_URL}{active.path}
            </span>
          </span>
        </div>

        {/* Response */}
        {!response && !isLoading && (
          <div className="flex items-center gap-2 text-[#333]">
            <span className="italic">// click &quot;Try it&quot; to fire a real request →</span>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-[#555]">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#F59E0B] border-t-transparent" />
            <span className="text-[#F59E0B]">// Waiting for response…</span>
          </div>
        )}

        {response && !isLoading && (
          <div>
            <div className="mb-2 text-[#444]">
              // Response in {elapsed}ms
            </div>
            <pre
              className="overflow-x-auto text-[#D4D4D4]"
              dangerouslySetInnerHTML={{
                __html: animatedLines
                  .map((line) => syntaxHighlight(line))
                  .join("\n"),
              }}
            />
            {animatedLines.length < response.split("\n").length && (
              <span className="inline-block h-3.5 w-1.5 animate-pulse bg-[#F59E0B]" />
            )}
          </div>
        )}
      </div>

      {/* Try it button */}
      <div className="border-t border-[#1A1A1A] px-4 py-3">
        <button
          onClick={handleTry}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-md bg-[#F59E0B] px-4 py-2 font-[family-name:var(--font-mono)] text-xs font-bold text-black transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />
              Sending…
            </>
          ) : (
            <>
              <span>▶</span>
              Try it — Live
            </>
          )}
        </button>
      </div>
    </div>
  );
}
