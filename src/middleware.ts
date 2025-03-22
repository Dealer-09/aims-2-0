import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";

export default clerkMiddleware();

export async function middleware(req: NextRequest) {
  console.log("🔥 Middleware is running on:", req.nextUrl.pathname); // ✅ Log route

  const { userId } = getAuth(req);
  console.log("🔹 User ID from Clerk:", userId); // ✅ Log user ID

  if (!userId) {
    console.log("❌ No userId, redirecting to /sign-in");
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  try {
    // 🔹 Fetch user role from Firestore using userId
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.log("❌ User not found in Firestore");
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const userData = userSnap.data();
    console.log("🔥 Firestore Role Detected:", userData?.role); // ✅ Log role

    // 🔹 Allow access to admin if role is admin
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (userData?.role === "admin") {
        console.log("✅ Admin detected, allowing access.");
        return NextResponse.next();
      } else {
        console.log("❌ User is NOT admin, redirecting to /study");
        return NextResponse.redirect(new URL("/study", req.url));
      }
    }

    return NextResponse.next(); // ✅ Allow access for other routes
  } catch (error) {
    console.error("❌ Firestore Error:", error);
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

// 🔹 Apply middleware only to these routes
export const config = {
  matcher: ["/admin/:path*", "/study/:path*", "/api/protected/:path*"],
  publicRoutes: ["/signup", "/sign-in"],
};