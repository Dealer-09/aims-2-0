import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

console.log("✅ Middleware file loaded!"); // ✅ This should appear when Next.js starts

// This middleware handles both Clerk authentication and CORS headers
export default clerkMiddleware((auth, req) => {
  console.log(`✅ Middleware processing route: ${req.nextUrl.pathname}`); // Add detailed logging

  // For API routes, add CORS headers
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    
    return response;
  }
  
  return NextResponse.next();
});

// Configure which routes should be handled by the middleware
export const config = {
  matcher: [
    // All admin routes
    '/admin/:path*',
    
    // All study routes
    '/study/:path*',
    
    // All API routes that need authentication
    '/api/:path*', // This will match ALL API routes, ensuring Clerk is available everywhere
    
    // Public pages that might need user data
    '/', 
    '/sign-in/:path*',
    '/sign-up/:path*',
    '/request-access'
  ],
};