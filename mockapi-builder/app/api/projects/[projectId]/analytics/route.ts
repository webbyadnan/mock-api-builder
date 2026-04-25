import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "24h";

    // Verify access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Determine time range
    const now = new Date();
    let startDate = new Date();
    
    if (timeframe === "7d") {
      startDate.setDate(now.getDate() - 7);
    } else {
      // Default 24h
      startDate.setHours(now.getHours() - 24);
    }

    // Fetch logs within timeframe
    const logs = await prisma.requestLog.findMany({
      where: {
        projectId,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        endpointId: true,
        method: true,
        path: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // 1. Total hits
    const totalHits = logs.length;

    // 2. Error rate (status >= 400)
    let errorHits = 0;
    
    // 3. Status breakdown (2xx, 4xx, 5xx)
    const statusCodes: Record<string, number> = {};

    // 4. Top endpoints
    const endpointCounts: Record<string, { method: string; path: string; count: number }> = {};

    // 5. Time series data (group by hour for 24h, or day for 7d)
    const timeSeriesMap: Record<string, number> = {};
    
    // Initialize time series bins to ensure there are no gaps
    if (timeframe === "24h") {
      for (let i = 24; i >= 0; i--) {
        const d = new Date(now);
        d.setHours(now.getHours() - i);
        d.setMinutes(0, 0, 0);
        const key = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeSeriesMap[key] = 0;
      }
    } else {
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const key = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        timeSeriesMap[key] = 0;
      }
    }

    // Aggregate data
    logs.forEach(log => {
      // Errors
      if (log.status >= 400) errorHits++;
      
      // Status breakdown
      const statusKey = log.status.toString();
      statusCodes[statusKey] = (statusCodes[statusKey] || 0) + 1;

      // Top endpoints
      const epKey = `${log.method} ${log.path}`;
      if (!endpointCounts[epKey]) {
        endpointCounts[epKey] = { method: log.method, path: log.path, count: 0 };
      }
      endpointCounts[epKey].count++;

      // Time series
      const logDate = new Date(log.createdAt);
      let timeKey = "";
      if (timeframe === "24h") {
        logDate.setMinutes(0, 0, 0);
        timeKey = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        timeKey = logDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
      
      if (timeSeriesMap[timeKey] !== undefined) {
        timeSeriesMap[timeKey]++;
      }
    });

    const errorRate = totalHits > 0 ? (errorHits / totalHits) * 100 : 0;

    const topEndpoints = Object.values(endpointCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const timeSeriesData = Object.entries(timeSeriesMap).map(([time, hits]) => ({
      time,
      hits,
    }));

    return NextResponse.json({
      totalHits,
      errorRate: Number(errorRate.toFixed(1)),
      statusCodes,
      timeSeriesData,
      topEndpoints,
    });
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
