import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePath } from "@/lib/utils";
import type { ApiResponse, HttpMethod } from "@/types";

interface RouteParams {
  params: Promise<{ projectId: string }>;
}

// GET /api/projects/[projectId]/endpoints — List all endpoints
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

    const endpoints = await prisma.endpoint.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: endpoints });
  } catch (error) {
    console.error("GET endpoints error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch endpoints" },
      { status: 500 },
    );
  }
}

// POST /api/projects/[projectId]/endpoints — Create a new endpoint
export async function POST(
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

    const body = await req.json();
    const {
      method,
      path,
      statusCode = 200,
      headers = {},
      body: responseBody = {},
      delay = 0,
    } = body as {
      method?: HttpMethod;
      path?: string;
      statusCode?: number;
      headers?: Record<string, string>;
      body?: unknown;
      delay?: number;
    };

    if (!method || !path) {
      return NextResponse.json(
        { success: false, error: "Method and path are required" },
        { status: 400 },
      );
    }

    const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { success: false, error: "Invalid HTTP method" },
        { status: 400 },
      );
    }

    const normalizedPath = normalizePath(path);

    // Check for duplicate method+path
    const existing = await prisma.endpoint.findUnique({
      where: {
        projectId_method_path: {
          projectId,
          method,
          path: normalizedPath,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: `Endpoint ${method} ${normalizedPath} already exists`,
        },
        { status: 409 },
      );
    }

    const endpoint = await prisma.endpoint.create({
      data: {
        method,
        path: normalizedPath,
        statusCode,
        headers: headers as object,
        body: responseBody as object,
        delay: Math.max(0, Math.min(delay, 10000)),
        projectId,
      },
    });

    return NextResponse.json(
      { success: true, data: endpoint, message: "Endpoint created" },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST endpoint error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create endpoint" },
      { status: 500 },
    );
  }
}
