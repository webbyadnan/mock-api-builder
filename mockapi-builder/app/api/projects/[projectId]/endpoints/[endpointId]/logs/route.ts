import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ projectId: string; endpointId: string }>;
}

// GET /api/projects/[projectId]/endpoints/[endpointId]/logs
// Returns the last 10 request logs for a specific endpoint
export async function GET(
  _req: Request,
  { params }: RouteParams,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId, endpointId } = await params;

    // Verify user has access to this project
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
      return new NextResponse("Not Found", { status: 404 });
    }

    // Verify endpoint belongs to this project
    const endpoint = await prisma.endpoint.findFirst({
      where: { id: endpointId, projectId },
    });

    if (!endpoint) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const logs = await prisma.requestLog.findMany({
      where: { endpointId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        method: true,
        path: true,
        status: true,
        ip: true,
        query: true,
        createdAt: true,
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET endpoint logs error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
