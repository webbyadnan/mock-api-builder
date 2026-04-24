import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId] — Get a single project with all endpoints
export async function GET(
  _req: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
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
        endpoints: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("GET /api/projects/[projectId] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

// PUT /api/projects/[projectId] — Update project name
export async function PUT(
  req: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { projectId } = await params;
    const body = await req.json();
    const { name } = body as { name?: string };

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Project name is required" },
        { status: 400 },
      );
    }

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { name: name.trim() },
    });

    return NextResponse.json({
      success: true,
      data: project,
      message: "Project updated",
    });
  } catch (error) {
    console.error("PUT /api/projects/[projectId] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
      { status: 500 },
    );
  }
}

// DELETE /api/projects/[projectId] — Delete project and all endpoints
export async function DELETE(
  _req: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { projectId } = await params;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    await prisma.project.delete({ where: { id: projectId } });

    return NextResponse.json({
      success: true,
      message: "Project deleted",
    });
  } catch (error) {
    console.error("DELETE /api/projects/[projectId] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
