import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware for route protection
 * 
 * WHY: Middleware runs at the edge (before page renders), providing:
 * 1. Faster redirects than client-side checks
 * 2. Protection against direct URL access
 * 3. Role-based access control for admin routes
 * 
 * Protected routes:
 * - /admin/* → Requires ADMIN role
 * - /cart → Requires authentication (optional, can be guest cart)
 * - /api/admin/* → Requires ADMIN role
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin route protection
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token }) {
        // Allow access if token exists (authenticated)
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

/**
 * Matcher configuration:
 * - /admin/*: All admin pages
 * - /api/admin/*: Admin API routes
 * - /cart: Cart page (optional - can be guest)
 * - /profile: User profile
 */
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/profile/:path*"],
};
