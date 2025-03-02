import { clerkMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = getAuth(req);
  const url = req.nextUrl.pathname;

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url)); // 🚀 Redirect unauthorized users
  }

  // 🔹 Fetch user role from Firestore
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.exists() ? userSnap.data() : null;

  // 🔹 Secure /admin route: Only allow admins
  if (url.startsWith("/admin") && userData?.role !== "admin") {
    return NextResponse.redirect(new URL("/study", req.url)); // 🚀 Redirect non-admins
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/study/:path*"], // ✅ Secure admin & student pages
};
