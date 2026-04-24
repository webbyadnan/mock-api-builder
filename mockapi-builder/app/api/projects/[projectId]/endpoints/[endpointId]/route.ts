import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePath } from "@/lib/utils";
import type { ApiResponse, HttpMethod } from "@/types";

interface RouteParams {
  params: Promise<{ projectId: string; endpointId: string }>;
}

// GET /api/projects/[projectId]/endpoints/[endpointId]
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

    const { projectId, endpointId } = await params;

    // Verify ownership or membership
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
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const endpoint = await prisma.endpoint.findUnique({
      where: { id: endpointId, projectId },
    });

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: "Endpoint not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: endpoint });
  } catch (error) {
    console.error("GET endpoint error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch endpoint" },
      { status: 500 },
    );
  }
}

// PUT /api/projects/[projectId]/endpoints/[endpointId]
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

    const { projectId, endpointId } = await params;

    // Verify ownership or membership
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
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const existing = await prisma.endpoint.findUnique({
      where: { id: endpointId, projectId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Endpoint not found" },
        { status: 404 },
      );
    }

    const body = await req.json();
    const {
      method,
      path,
      statusCode,
      headers,
      body: responseBody,
      delay,
      isActive,
    } = body as {
      method?: HttpMethod;
      path?: string;
      statusCode?: number;
      headers?: Record<string, string>;
      body?: unknown;
      delay?: number;
      isActive?: boolean;
    };

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (method !== undefined) updateData.method = method;
    if (path !== undefined) updateData.path = normalizePath(path);
    if (statusCode !== undefined) updateData.statusCode = statusCode;
    if (headers !== undefined) updateData.headers = headers;
    if (responseBody !== undefined) updateData.body = responseBody;
    if (delay !== undefined) updateData.delay = Math.max(0, Math.min(delay, 10000));
    if (isActive !== undefined) updateData.isActive = isActive;

    // Check for method+path conflict if they changed
    if (method || path) {
      const checkMethod = method || existing.method;
      const checkPath = path ? normalizePath(path) : existing.path;

      const conflict = await prisma.endpoint.findFirst({
        where: {
          projectId,
          method: checkMethod,
          path: checkPath,
          id: { not: endpointId },
        },
      });

      if (conflict) {
        return NextResponse.json(
          {
            success: false,
            error: `Endpoint ${checkMethod} ${checkPath} already exists`,
          },
          { status: 409 },
        );
      }
    }

    const endpoint = await prisma.endpoint.update({
      where: { id: endpointId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: endpoint,
      message: "Endpoint updated",
    });
  } catch (error) {
    console.error("PUT endpoint error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update endpoint" },
      { status: 500 },
    );
  }
}

// DELETE /api/projects/[projectId]/endpoints/[endpointId]
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

    const { projectId, endpointId } = await params;

    // Verify ownership or membership
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
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 },
      );
    }

    const existing = await prisma.endpoint.findUnique({
      where: { id: endpointId, projectId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Endpoint not found" },
        { status: 404 },
      );
    }

    await prisma.endpoint.delete({ where: { id: endpointId } });

    return NextResponse.json({
      success: true,
      message: "Endpoint deleted",
    });
  } catch (error) {
    console.error("DELETE endpoint error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete endpoint" },
      { status: 500 },
    );
  }
}
