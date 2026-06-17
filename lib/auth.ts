import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

// GitHub OAuth with the minimal scopes the app needs.
//
// The Prisma adapter persists User + Account rows (the GitHub access token is
// stored on the Account), but we deliberately keep JWT sessions: the token
// also rides into the session so the Apollo auth link can attach it per
// request. Switching to database sessions would add a DB round-trip per
// request and complicate that token flow for no benefit here.
export const authOptions: NextAuthOptions = {
  // The adapter's PrismaClient typing predates Prisma 7's generated client;
  // the shapes are structurally identical at runtime.
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: { strategy: "jwt" },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "read:user public_repo" } },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      // account/profile/user only exist on initial sign-in — persist what we need.
      // With the adapter, `user.id` is the database (cuid) id.
      if (user) token.sub = user.id;
      if (account) token.accessToken = account.access_token;
      if (profile && "login" in profile) {
        const login = (profile as { login: string }).login;
        token.login = login;
        // Backfill the GitHub handle onto the User row (adapter doesn't map it)
        if (user) {
          await prisma.user.update({ where: { id: user.id }, data: { login } });
        }
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.sub ?? "";
      session.user.login = token.login ?? "";
      return session;
    },
  },
};
