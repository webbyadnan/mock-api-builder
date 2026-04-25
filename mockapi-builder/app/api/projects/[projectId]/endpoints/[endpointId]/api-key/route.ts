import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ projectId: string; endpointId: string }>;
}

// POST /api/projects/[projectId]/endpoints/[endpointId]/api-key
// Generate a new API key for this endpoint (only owner can do this)
export async function POST(
  _req: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, endpointId } = await params;

    // Only project owner can manage API keys
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Not found or insufficient permissions" }, { status: 404 });
    }

    const endpoint = await prisma.endpoint.findFirst({
      where: { id: endpointId, projectId },
    });

    if (!endpoint) {
      return NextResponse.json({ success: false, error: "Endpoint not found" }, { status: 404 });
    }

    // Generate a new key: sk_mock_<random>
    const plainKey = `sk_mock_${nanoid(24)}`;
    const hash = await bcrypt.hash(plainKey, 10);

    await prisma.endpoint.update({
      where: { id: endpointId },
      data: {
        apiKeyRequired: true,
        apiKeyHash: hash,
      },
    });

    // Return plaintext key ONCE — it won't be stored or recoverable
    return NextResponse.json({
      success: true,
      data: { key: plainKey },
      message: "API key generated. Copy it now — it won't be shown again.",
    });
  } catch (error) {
    console.error("POST api-key error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate key" }, { status: 500 });
  }
}

// DELETE /api/projects/[projectId]/endpoints/[endpointId]/api-key
// Revoke API key protection from this endpoint
export async function DELETE(
  _req: Request,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, endpointId } = await params;

    // Only project owner can manage API keys
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Not found or insufficient permissions" }, { status: 404 });
    }

    const endpoint = await prisma.endpoint.findFirst({
      where: { id: endpointId, projectId },
    });

    if (!endpoint) {
      return NextResponse.json({ success: false, error: "Endpoint not found" }, { status: 404 });
    }

    await prisma.endpoint.update({
      where: { id: endpointId },
      data: {
        apiKeyRequired: false,
        apiKeyHash: null,
      },
    });

    return NextResponse.json({ success: true, message: "API key revoked" });
  } catch (error) {
    console.error("DELETE api-key error:", error);
    return NextResponse.json({ success: false, error: "Failed to revoke key" }, { status: 500 });
  }
}
