import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes — no auth required
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isApiMockRoute = pathname.startsWith("/api/mock/");
  const isAuthRoute = pathname.startsWith("/api/auth/");
  const isPublicAsset = pathname.startsWith("/_next/") || pathname.startsWith("/favicon");

  if (isPublicRoute || isApiMockRoute || isAuthRoute || isPublicAsset) {
    return NextResponse.next();
  }

  // Protected routes — require auth
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
