import { authMiddleware } from "@clerk/nextjs"; // ✅ Correct import
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
export default authMiddleware({
  publicRoutes: ["/", "/request-access", "/sign-in", "/sign-up"],

  afterAuth(auth, req) {
    // Redirect users who are not logged in
    if (!auth.userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  },
});

// Apply middleware only to certain routes
export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"], // ✅ Excludes static files & Next.js internal routes
};