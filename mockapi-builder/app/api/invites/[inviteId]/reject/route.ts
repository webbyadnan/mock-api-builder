import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/invites/[inviteId]/reject
export async function POST(
  req: Request,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { inviteId } = await params;

    const invite = await prisma.projectInvite.findUnique({ where: { id: inviteId } });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.inviteeEmail !== session.user.email) {
      return NextResponse.json({ error: "This invite is not for you" }, { status: 403 });
    }

    if (invite.status !== "PENDING") {
      return NextResponse.json({ error: "Invite already " + invite.status.toLowerCase() }, { status: 400 });
    }

    await prisma.projectInvite.update({
      where: { id: inviteId },
      data: { status: "REJECTED" }
    });

    return NextResponse.json({ message: "Invite rejected" });
  } catch (error) {
    console.error("Reject invite error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
