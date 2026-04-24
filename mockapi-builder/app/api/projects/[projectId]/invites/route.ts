import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/projects/[projectId]/invites — List invites for a project
export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { projectId } = await params;

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

    const invites = await prisma.projectInvite.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: {
        inviter: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error("GET invites error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// POST /api/projects/[projectId]/invites — Send an invite
export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { projectId } = await params;
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Only owner can invite
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id }
    });
    if (!project) {
      return NextResponse.json({ error: "Only the project owner can send invites" }, { status: 403 });
    }

    // Can't invite yourself
    if (email === session.user.email) {
      return NextResponse.json({ error: "You can't invite yourself" }, { status: 400 });
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: targetUser.id } }
    });
    if (existingMember) {
      return NextResponse.json({ error: "User is already a team member" }, { status: 400 });
    }

    // Check if invite already pending
    const existingInvite = await prisma.projectInvite.findFirst({
      where: { projectId, inviteeEmail: email, status: "PENDING" }
    });
    if (existingInvite) {
      return NextResponse.json({ error: "An invite is already pending for this user" }, { status: 400 });
    }

    // Create invite
    const invite = await prisma.projectInvite.create({
      data: {
        projectId,
        inviterUserId: session.user.id,
        inviteeEmail: email,
      },
      include: {
        inviter: { select: { id: true, name: true, email: true } }
      }
    });

    // Create notification for invitee
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: "INVITE",
        title: "Team Invite",
        message: `${session.user.name || session.user.email} invited you to join "${project.name}"`,
        link: `/dashboard`,
        meta: { inviteId: invite.id, projectId, projectName: project.name }
      }
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error("POST invite error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
