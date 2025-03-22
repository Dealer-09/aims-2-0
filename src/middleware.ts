import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";

export default clerkMiddleware();

// Custom middleware to check user roles in Firestore
export async function middleware(req: NextRequest) {
  const { userId } = getAuth(req); // ✅ Works in Clerk 6.12.2
  const url = req.nextUrl.pathname;

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url)); // 🚀 Redirect unauthorized users
  }

  try {
    // 🔹 Fetch user role from Firestore using userId
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.redirect(new URL("/sign-in", req.url)); // 🚀 Redirect if user not found
    }

    const userData = userSnap.data();

    // 🔹 Secure /admin route: Only allow admins
    if (url.startsWith("/admin") && userData?.role !== "admin") {
      return NextResponse.redirect(new URL("/study", req.url)); // 🚀 Redirect non-admins
    }

    return NextResponse.next();
  } catch (error) {
    console.error("❌ Firestore Error:", error);
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

// 🔹 Apply middleware only to these routes
export const config = {
  matcher: ["/admin/:path*", "/study/:path*", "/api/protected/:path*"], // ✅ Secure API routes too
};