import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const role = token?.role as string | undefined;

    // Protecting /dashboard routes: only OWNER and STAFF can access
    if (pathname.startsWith("/dashboard")) {
      if (role !== "OWNER" && role !== "STAFF") {
        return NextResponse.redirect(new URL("/portal", req.url));
      }
    }

    // Protecting /portal routes: tenants or owners
    if (pathname.startsWith("/portal")) {
      if (!role) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Allow public pages and auth routes without session
        if (
          pathname === "/" ||
          pathname.startsWith("/kamar") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/api/public") ||
          pathname.startsWith("/api/payment/midtrans-webhook")
        ) {
          return true;
        }

        // Must have token for /dashboard, /portal, or protected API routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portal/:path*",
  ],
};
