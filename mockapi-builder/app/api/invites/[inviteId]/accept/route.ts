import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/invites/[inviteId]/accept
export async function POST(
  req: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { inviteId } = await params;

    const invite = await prisma.projectInvite.findUnique({
      where: { id: inviteId },
      include: { project: true }
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Only invitee can accept
    if (invite.inviteeEmail !== session.user.email) {
      return NextResponse.json({ error: "This invite is not for you" }, { status: 403 });
    }

    if (invite.status !== "PENDING") {
      return NextResponse.json({ error: "Invite already " + invite.status.toLowerCase() }, { status: 400 });
    }

    // Accept: update invite + create membership
    await prisma.$transaction([
      prisma.projectInvite.update({
        where: { id: inviteId },
        data: { status: "ACCEPTED" }
      }),
      prisma.projectMember.create({
        data: {
          projectId: invite.projectId,
          userId: session.user.id,
          role: "MEMBER"
        }
      }),
      // Notify the project owner
      prisma.notification.create({
        data: {
          userId: invite.inviterUserId,
          type: "INVITE_ACCEPTED",
          title: "Invite Accepted",
          message: `${session.user.name || session.user.email} accepted your invite to "${invite.project.name}"`,
          link: `/dashboard/projects/${invite.projectId}/settings`,
          meta: { projectId: invite.projectId }
        }
      })
    ]);

    return NextResponse.json({ message: "Invite accepted" });
  } catch (error) {
    console.error("Accept invite error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
