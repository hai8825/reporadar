import { withAuth } from "next-auth/middleware";

// No unauthenticated access in v1 — every app route bounces to /login
export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  // Protect everything except auth endpoints, the login page, and static assets
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};
