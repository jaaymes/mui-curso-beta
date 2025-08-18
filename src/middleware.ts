import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // const response = NextResponse.next();
  // Static assets - longer cache
  //   if (
  //     request.nextUrl.pathname.startsWith("/_next/static") ||
  //     request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp)$/)
  //   ) {
  //     response.headers.set(
  //       "Cache-Control",
  //       "public, max-age=31536000, immutable"
  //     );
  //   }
  //   return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes should not be cached)
     * - _next/static (already handled by Next.js)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
