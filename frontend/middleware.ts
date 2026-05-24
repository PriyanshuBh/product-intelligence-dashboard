import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(request: NextRequest) {
  // Better Auth default cookie names
  const sessionCookie = 
    request.cookies.get("better-auth.session_token") || 
    request.cookies.get("__Secure-better-auth.session_token")
    
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup")

  if (!sessionCookie && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/alerts/:path*",
    "/upload/:path*",
    "/jobs/:path*",
    "/login",
    "/signup",
  ],
}
