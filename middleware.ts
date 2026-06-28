import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = ["/", "/terms", "/privacy"].includes(nextUrl.pathname)
  const isAuthRoute = ["/login", "/signup", "/forgot-password"].includes(nextUrl.pathname)

  if (isApiAuthRoute) return null

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/chat", nextUrl))
    }
    return null
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  return null
})

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png|manifest.json|robots.txt|icons/).*)"],
}
