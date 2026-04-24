import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects/[projectId]/chat — Fetch chat messages
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { projectId } = await params;

    // Check access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      }
    });
    if (!project) return new NextResponse("Not Found", { status: 404 });

    // Get cursor from query for polling
    const { searchParams } = new URL(req.url);
    const after = searchParams.get("after");

    const messages = await prisma.chatMessage.findMany({
      where: {
        projectId,
        ...(after ? { createdAt: { gt: new Date(after) } } : {})
      },
      orderBy: { createdAt: "asc" },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        endpoint: { select: { id: true, method: true, path: true } }
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET chat error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/projects/[projectId]/chat — Send a chat message
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { projectId } = await params;
    const { message, endpointId } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      },
      include: {
        members: true
      }
    });
    if (!project) return new NextResponse("Not Found", { status: 404 });

    const chatMessage = await prisma.chatMessage.create({
      data: {
        projectId,
        userId: session.user.id,
        message: message.trim(),
        endpointId: endpointId || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        endpoint: { select: { id: true, method: true, path: true } }
      }
    });

    // Notify other members
    const allUserIds = [project.userId, ...project.members.map(m => m.userId)];
    const notifyUserIds = allUserIds.filter(id => id !== session.user.id);

    if (notifyUserIds.length > 0) {
      await prisma.notification.createMany({
        data: notifyUserIds.map(userId => ({
          userId,
          type: "NEW_MESSAGE",
          title: `New message in ${project.name}`,
          message: `${session.user?.name || session.user?.email} sent a message.`,
          link: `/dashboard/projects/${projectId}/chat`,
          meta: { projectId }
        }))
      });
    }

    return NextResponse.json(chatMessage, { status: 201 });
  } catch (error) {
    console.error("POST chat error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
