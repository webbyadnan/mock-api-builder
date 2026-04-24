import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = await params;

    // Check if user has access to project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      }
    });

    if (!project) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const logs = await prisma.requestLog.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100 logs
      include: {
        endpoint: {
          select: {
            method: true,
            path: true
          }
        }
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch logs", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
