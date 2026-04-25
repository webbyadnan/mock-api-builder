"use client";

import { useState, useEffect, use } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Activity, AlertTriangle, Route, Clock } from "lucide-react";
import { Select } from "@/components/ui/Select";

interface AnalyticsData {
  totalHits: number;
  errorRate: number;
  statusCodes: Record<string, number>;
  timeSeriesData: { time: string; hits: number }[];
  topEndpoints: { method: string; path: string; count: number }[];
}

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("24h");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/projects/${projectId}/analytics?timeframe=${timeframe}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId, timeframe]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-medium text-[#9C9789]">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-medium text-red-500">Failed to load analytics</div>
      </div>
    );
  }

  // Format status codes for BarChart
  const statusData = Object.entries(data.statusCodes).map(([status, count]) => ({
    name: status,
    count,
  })).sort((a, b) => a.name.localeCompare(b.name));

  const getStatusColor = (status: string) => {
    if (status.startsWith("2")) return "#10B981"; // green
    if (status.startsWith("4")) return "#F59E0B"; // yellow
    if (status.startsWith("5")) return "#EF4444"; // red
    return "#9C9789"; // gray
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "text-emerald-600 bg-emerald-50";
      case "POST": return "text-blue-600 bg-blue-50";
      case "PUT": return "text-amber-600 bg-amber-50";
      case "DELETE": return "text-red-600 bg-red-50";
      case "PATCH": return "text-purple-600 bg-purple-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-mono)] text-lg font-bold text-[#1A1A1A]">
          Traffic Overview
        </h2>
        <div className="w-40">
          <Select
            label=""
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            options={[
              { value: "24h", label: "Last 24 Hours" },
              { value: "7d", label: "Last 7 Days" },
            ]}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Hits */}
        <div className="rounded-xl border border-[#E5E1D8] bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#9C9789] uppercase tracking-wider">Total Requests</h3>
            <Activity className="h-4 w-4 text-[#1A1A1A]" />
          </div>
          <p className="font-[family-name:var(--font-mono)] text-3xl font-bold text-[#1A1A1A]">
            {data.totalHits.toLocaleString()}
          </p>
        </div>

        {/* Error Rate */}
        <div className="rounded-xl border border-[#E5E1D8] bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#9C9789] uppercase tracking-wider">Error Rate</h3>
            <AlertTriangle className={`h-4 w-4 ${data.errorRate > 5 ? "text-red-500" : "text-amber-500"}`} />
          </div>
          <p className="font-[family-name:var(--font-mono)] text-3xl font-bold text-[#1A1A1A]">
            {data.errorRate}%
          </p>
        </div>

        {/* Active Endpoints */}
        <div className="rounded-xl border border-[#E5E1D8] bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#9C9789] uppercase tracking-wider">Active Endpoints</h3>
            <Route className="h-4 w-4 text-[#6366F1]" />
          </div>
          <p className="font-[family-name:var(--font-mono)] text-3xl font-bold text-[#1A1A1A]">
            {Object.keys(data.topEndpoints).length}
          </p>
        </div>
        
        {/* Status */}
        <div className="rounded-xl border border-[#E5E1D8] bg-white p-5 shadow-sm transition-all hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#9C9789] uppercase tracking-wider">Timeframe</h3>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="font-[family-name:var(--font-mono)] text-3xl font-bold text-[#1A1A1A] capitalize">
            {timeframe === "24h" ? "24 Hours" : "7 Days"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Chart */}
        <div className="lg:col-span-2 rounded-xl border border-[#E5E1D8] bg-white p-5 shadow-sm">
          <h3 className="mb-6 font-[family-name:var(--font-mono)] text-sm font-bold text-[#1A1A1A]">
            Requests Over Time
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeSeriesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E1D8" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 11, fill: '#9C9789' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#9C9789' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E1D8', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1A1A1A', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="hits" 
                  stroke="#1A1A1A" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#1A1A1A', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Codes Chart */}
        <div className="rounded-xl border border-[#E5E1D8] bg-white p-5 shadow-sm">
          <h3 className="mb-6 font-[family-name:var(--font-mono)] text-sm font-bold text-[#1A1A1A]">
            Status Codes
          </h3>
          <div className="h-[300px] w-full">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E1D8" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: '#9C9789', fontWeight: 'bold' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#9C9789' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#F9F8F6' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E1D8' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[#9C9789]">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Endpoints */}
      <div className="rounded-xl border border-[#E5E1D8] bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-[family-name:var(--font-mono)] text-sm font-bold text-[#1A1A1A]">
          Most Active Endpoints
        </h3>
        
        {data.topEndpoints.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#9C9789]">
            No traffic recorded in this timeframe
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E5E1D8]">
                  <th className="pb-3 pr-4 font-medium text-[#9C9789]">Method</th>
                  <th className="pb-3 pr-4 font-medium text-[#9C9789]">Path</th>
                  <th className="pb-3 text-right font-medium text-[#9C9789]">Hits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D8]">
                {data.topEndpoints.map((ep, i) => (
                  <tr key={i} className="transition-colors hover:bg-[#F9F8F6]">
                    <td className="py-3 pr-4">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getMethodColor(ep.method)}`}>
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-[family-name:var(--font-mono)] text-[#1A1A1A]">
                      {ep.path}
                    </td>
                    <td className="py-3 text-right font-medium text-[#1A1A1A]">
                      {ep.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
