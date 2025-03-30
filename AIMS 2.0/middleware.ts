import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

console.log("✅ Middleware file loaded!"); // ✅ This should appear when Next.js starts

export default clerkMiddleware(async (auth, req) => {
  console.log("🔥 Middleware is running on:", req.nextUrl.pathname);
  console.log("🔹 Clerk Auth Object:", auth); // ✅ Check what Clerk provides

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/study/:path*", "/api/protected/:path*"],
  publicRoutes: ["/signup", "/sign-in"],
};