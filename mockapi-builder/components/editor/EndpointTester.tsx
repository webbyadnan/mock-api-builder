"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface EndpointTesterProps {
  url: string;
  method: string;
}

interface TestResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
}

export function EndpointTester({ url, method }: EndpointTesterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState("");

  const handleTest = async () => {
    setIsLoading(true);
    setError("");
    setResult(null);

    const start = performance.now();

    try {
      const res = await fetch(url, { method });
      const elapsed = Math.round(performance.now() - start);

      const headers: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headers[key] = value;
      });

      let body: string;
      try {
        const json = await res.json();
        body = JSON.stringify(json, null, 2);
      } catch {
        body = await res.text();
      }

      setResult({
        status: res.status,
        statusText: res.statusText,
        headers,
        body,
        time: elapsed,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send request",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (status >= 400 && status < 500) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="rounded-lg border border-[#E5E1D8] bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[#1A1A1A]">
          Test Endpoint
        </h3>
        <Button onClick={handleTest} size="sm" isLoading={isLoading} className="gap-2">
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          Send Request
        </Button>
      </div>

      {/* URL display */}
      <div className="mt-3 rounded-md border border-[#E5E1D8] bg-[#F7F4EF] px-3 py-2">
        <code className="font-[family-name:var(--font-mono)] text-xs text-[#9C9789]">
          <span className="font-semibold text-[#1A1A1A]">{method}</span>{" "}
          {url}
        </code>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 space-y-3">
          {/* Status + time */}
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex rounded-md border px-2 py-0.5 font-[family-name:var(--font-mono)] text-xs font-semibold ${getStatusColor(result.status)}`}
            >
              {result.status} {result.statusText}
            </span>
            <span className="font-[family-name:var(--font-mono)] text-xs text-[#9C9789]">
              {result.time}ms
            </span>
          </div>

          {/* Response body */}
          <div>
            <p className="mb-1 text-xs font-medium text-[#9C9789]">Response Body</p>
            <pre className="code-block max-h-64 overflow-auto text-xs">
              {result.body}
            </pre>
          </div>

          {/* Response headers */}
          <div>
            <p className="mb-1 text-xs font-medium text-[#9C9789]">
              Response Headers
            </p>
            <div className="rounded-md border border-[#E5E1D8] bg-[#F7F4EF] p-3">
              {Object.entries(result.headers).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="font-[family-name:var(--font-mono)] font-medium text-[#1A1A1A]">
                    {key}
                  </span>
                  <span className="text-[#9C9789]">: {value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
