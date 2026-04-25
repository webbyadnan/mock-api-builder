"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, Activity, Globe } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { HttpMethod } from "@/types";

interface RecentLog {
  id: string;
  method: string;
  path: string;
  status: number;
  ip: string;
  createdAt: string;
}

interface RecentHitsPanelProps {
  projectId: string;
  endpointId: string;
}

export function RecentHitsPanel({ projectId, endpointId }: RecentHitsPanelProps) {
  const [logs, setLogs] = useState<RecentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/endpoints/${endpointId}/logs`
      );
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
        setLastRefreshed(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, endpointId]);

  // Initial fetch
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchLogs, 30_000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const statusColor = (code: number) => {
    if (code >= 200 && code < 300) return "text-emerald-600";
    if (code >= 400) return "text-red-500";
    return "text-amber-500";
  };

  return (
    <div className="rounded-lg border border-[#E5E1D8] bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#E5E1D8] bg-[#F9F8F6] px-4 py-3">
        <Activity className="h-4 w-4 text-[#F59E0B]" />
        <span className="font-[family-name:var(--font-mono)] text-sm font-semibold text-[#1A1A1A]">
          Recent Hits
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#9C9789]">
          (last 10)
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[10px] text-[#9C9789]">
            refreshed {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
          </span>
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="text-[#9C9789] transition-colors hover:text-[#1A1A1A] disabled:opacity-40"
            title="Refresh logs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading && logs.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-[#9C9789]">
          Loading…
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <Globe className="h-6 w-6 text-[#C8C4BB]" />
          <p className="text-xs text-[#9C9789]">
            No requests yet. Hit your endpoint URL to see logs here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#F0EDE6]">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F9F8F6] transition-colors"
            >
              <Badge method={log.method as HttpMethod} />
              <span className="flex-1 font-[family-name:var(--font-mono)] text-xs text-[#1A1A1A] truncate">
                {log.path}
              </span>
              <span
                className={`font-[family-name:var(--font-mono)] text-xs font-bold tabular-nums ${statusColor(log.status)}`}
              >
                {log.status}
              </span>
              <span className="w-20 text-right font-[family-name:var(--font-mono)] text-[10px] text-[#9C9789] truncate">
                {log.ip}
              </span>
              <span className="w-20 text-right text-[10px] text-[#9C9789]">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
