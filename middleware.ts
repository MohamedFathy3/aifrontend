import { NextRequest, NextResponse } from "next/server";

/**
 * This middleware is a UX convenience ONLY. It checks for the presence of
 * Laravel's session cookie to decide whether to bounce the user to /login
 * before a page even renders. It is NOT a security boundary:
 *
 * - It cannot read the (HttpOnly, encrypted) cookie's contents, only whether
 *   one exists, so it cannot tell if the session is actually still valid.
 * - Every real protected page also calls /api/v1/auth/me, and every
 *   protected API endpoint re-checks auth + role server-side regardless
 *   (spec section 3). This middleware just avoids a flash of protected UI.
 */
const SESSION_COOKIE_NAME = "pyramidth_crm_session";
const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/sanctum")) {
    return NextResponse.next();
  }

  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!hasSessionCookie && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|sanctum|_next/static|_next/image|favicon.ico).*)"],
};
