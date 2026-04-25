import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/seed-demo
// One-time route to seed the public "demo" project with sample endpoints.
// Visit this URL once after deploying to set up the live demo widget.
export async function GET() {
  try {
    const DEMO_OWNER_EMAIL = process.env.DEMO_OWNER_EMAIL || "demo@mockapi.adnanxdev.site";

    // Get or create a demo owner user (no password — not a real account)
    let owner = await prisma.user.findUnique({ where: { email: DEMO_OWNER_EMAIL } });
    if (!owner) {
      owner = await prisma.user.create({
        data: {
          email: DEMO_OWNER_EMAIL,
          name: "MockAPI Demo",
        },
      });
    }

    // Check if demo project already exists
    const existing = await prisma.project.findUnique({ where: { slug: "demo" } });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Demo project already exists",
        projectId: existing.id,
      });
    }

    // Create the demo project
    const project = await prisma.project.create({
      data: {
        name: "Live Demo",
        slug: "demo",
        userId: owner.id,
      },
    });

    // Seed endpoints
    await prisma.endpoint.createMany({
      data: [
        {
          method: "GET",
          path: "/users",
          statusCode: 200,
          headers: {},
          body: [
            { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin", avatar: "https://i.pravatar.cc/150?img=1" },
            { id: 2, name: "Bob Smith", email: "bob@example.com", role: "user", avatar: "https://i.pravatar.cc/150?img=2" },
            { id: 3, name: "Carol White", email: "carol@example.com", role: "user", avatar: "https://i.pravatar.cc/150?img=3" },
          ],
          delay: 0,
          projectId: project.id,
        },
        {
          method: "GET",
          path: "/products",
          statusCode: 200,
          headers: {},
          body: [
            { id: 1, name: "MacBook Pro 16\"", price: 2499.99, inStock: true, category: "laptops" },
            { id: 2, name: "AirPods Pro", price: 249.99, inStock: true, category: "audio" },
            { id: 3, name: "iPhone 15 Pro", price: 999.99, inStock: false, category: "phones" },
            { id: 4, name: "iPad Air", price: 599.99, inStock: true, category: "tablets" },
          ],
          delay: 0,
          projectId: project.id,
        },
        {
          method: "POST",
          path: "/auth/login",
          statusCode: 200,
          headers: {},
          body: {
            success: true,
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
            expiresIn: 86400,
            user: { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin" },
          },
          delay: 0,
          projectId: project.id,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Demo project seeded successfully!",
      projectId: project.id,
      slug: "demo",
    });
  } catch (error) {
    console.error("Seed demo error:", error);
    return NextResponse.json({ success: false, error: "Failed to seed demo" }, { status: 500 });
  }
}
