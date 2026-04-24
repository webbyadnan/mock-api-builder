"use client";

import { use, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, RefreshCw, Activity } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { HttpMethod } from "@/types";

interface RequestLog {
  id: string;
  method: string;
  path: string;
  status: number;
  headers: Record<string, string>;
  body: any;
  query: Record<string, string>;
  ip: string;
  createdAt: string;
  endpoint?: {
    method: string;
    path: string;
  };
}

export default function LogsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-[family-name:var(--font-mono)] text-xl font-bold text-[#1A1A1A]">
            Request Logs
          </h2>
          <p className="mt-1 text-sm text-[#9C9789]">
            Real-time history of incoming requests to your mock APIs.
          </p>
        </div>
        <Button onClick={fetchLogs} variant="secondary" size="sm" isLoading={isLoading} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {logs.length === 0 && !isLoading ? (
        <EmptyState
          icon={<Activity className="h-7 w-7" />}
          title="No requests yet"
          description="Send a request to your mock API to see it appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#E5E1D8] bg-white">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div key={log.id} className="border-b border-[#E5E1D8] last:border-b-0">
                {/* Row Summary */}
                <div 
                  className="flex cursor-pointer items-center gap-4 px-4 py-3 hover:bg-[#F0EDE6]"
                  onClick={() => toggleExpand(log.id)}
                >
                  <Badge method={log.method as HttpMethod} />
                  <span className="flex-1 font-[family-name:var(--font-mono)] text-sm text-[#1A1A1A]">
                    {log.path}
                  </span>
                  
                  {/* Status Code */}
                  <span className={`font-[family-name:var(--font-mono)] text-xs font-bold ${
                    log.status >= 200 && log.status < 300 ? "text-emerald-600" :
                    log.status >= 400 ? "text-red-600" : "text-[#F59E0B]"
                  }`}>
                    {log.status}
                  </span>

                  <span className="text-xs text-[#9C9789] w-32 text-right">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>

                  <div className="text-[#9C9789]">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="bg-[#F9F8F6] p-4 text-sm">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Col: Headers & Details */}
                      <div>
                        <h4 className="mb-2 font-[family-name:var(--font-mono)] text-xs font-bold text-[#1A1A1A]">
                          REQUEST DETAILS
                        </h4>
                        <div className="rounded border border-[#E5E1D8] bg-white p-3 font-[family-name:var(--font-mono)] text-xs text-[#666]">
                          <div><span className="font-semibold text-[#1A1A1A]">IP:</span> {log.ip}</div>
                          {Object.keys(log.query || {}).length > 0 && (
                            <div className="mt-2">
                              <span className="font-semibold text-[#1A1A1A]">Query:</span>
                              <pre className="mt-1 overflow-x-auto text-[#888]">{JSON.stringify(log.query, null, 2)}</pre>
                            </div>
                          )}
                          <div className="mt-2">
                            <span className="font-semibold text-[#1A1A1A]">Headers:</span>
                            <div className="mt-1 max-h-40 overflow-y-auto">
                              {Object.entries(log.headers || {}).map(([k, v]) => (
                                <div key={k} className="flex gap-2 whitespace-nowrap">
                                  <span className="text-[#1A1A1A]">{k}:</span>
                                  <span className="text-[#888] overflow-hidden text-ellipsis">{v as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Col: Body */}
                      <div>
                        <h4 className="mb-2 font-[family-name:var(--font-mono)] text-xs font-bold text-[#1A1A1A]">
                          REQUEST BODY
                        </h4>
                        <div className="rounded border border-[#E5E1D8] bg-[#1E1E1E] p-3 font-[family-name:var(--font-mono)] text-xs text-[#D4D4D4] max-h-[250px] overflow-y-auto">
                          {log.body && Object.keys(log.body).length > 0 ? (
                            <pre>{JSON.stringify(log.body, null, 2)}</pre>
                          ) : (
                            <span className="italic text-[#888]">No body</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
