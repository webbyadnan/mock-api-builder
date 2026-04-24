import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import type { ApiResponse } from "@/types";

// GET /api/projects — List all projects for the authenticated user
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { endpoints: true } },
        endpoints: {
          select: { method: true },
          take: 10,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

// POST /api/projects — Create a new project
export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name } = body as { name?: string };

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Project name is required" },
        { status: 400 },
      );
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { success: false, error: "Project name must be 50 characters or less" },
        { status: 400 },
      );
    }

    const slug = generateSlug(name.trim());

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        slug,
        userId: session.user.id,
      },
      include: {
        _count: { select: { endpoints: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: project, message: "Project created" },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 },
    );
  }
}
