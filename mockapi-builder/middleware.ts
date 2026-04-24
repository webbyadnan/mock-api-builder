import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
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
  // We check for the session cookie directly to avoid loading Prisma/bcrypt in Edge Runtime
  const isAuthenticated = 
    req.cookies.has("authjs.session-token") || 
    req.cookies.has("__Secure-authjs.session-token") ||
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token");

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
