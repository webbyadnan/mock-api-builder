import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Personal projects — owned by the user
  const myProjects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { endpoints: true, members: true } },
      endpoints: {
        select: { method: true },
        take: 10,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Team projects — where user is a member but NOT the owner
  const teamProjects = await prisma.project.findMany({
    where: {
      members: { some: { userId: session.user.id } },
      NOT: { userId: session.user.id },
    },
    include: {
      user: { select: { name: true, email: true, image: true } },
      _count: { select: { endpoints: true, members: true } },
      endpoints: {
        select: { method: true },
        take: 10,
      },
      members: {
        select: {
          role: true,
          user: { select: { name: true, image: true } },
        },
        take: 5,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serializeDate = (p: any) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  });

  return (
    <DashboardContent
      myProjects={myProjects.map(serializeDate)}
      teamProjects={teamProjects.map(serializeDate)}
    />
  );
}
