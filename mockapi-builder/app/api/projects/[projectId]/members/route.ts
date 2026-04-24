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

    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        OR: [
          { userId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      },
      include: {
        user: { select: { id: true, name: true, email: true } }, // Owner
        members: { include: { user: { select: { id: true, name: true, email: true } } } } // Team
      }
    });

    if (!project) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json({
      owner: project.user,
      members: project.members.map(m => ({
        id: m.id,
        role: m.role,
        createdAt: m.createdAt,
        user: m.user
      }))
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = await params;
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Only OWNER can add members
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id }
    });

    if (!project) {
      return NextResponse.json({ error: "Only the project owner can invite members" }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({ where: { email } });
    
    if (!targetUser) {
      return NextResponse.json({ error: "User with this email not found on the platform" }, { status: 404 });
    }

    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: "You are already the owner" }, { status: 400 });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: targetUser.id }
      }
    });

    if (existingMember) {
      return NextResponse.json({ error: "User is already a team member" }, { status: 400 });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUser.id,
        role: "MEMBER"
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    return NextResponse.json(member);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { projectId } = await params;
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "Member ID required" }, { status: 400 });
    }

    // Only OWNER can remove members
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id }
    });

    if (!project) {
      return NextResponse.json({ error: "Only the project owner can remove members" }, { status: 403 });
    }

    await prisma.projectMember.delete({
      where: { id: memberId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
