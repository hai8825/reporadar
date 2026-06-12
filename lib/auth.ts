import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

// GitHub OAuth with the minimal scopes the app needs. The access token is
// carried through the JWT into the session so Apollo can attach it per request.
export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: { params: { scope: "read:user public_repo" } },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, account, profile }) {
      // account/profile only exist on initial sign-in — persist what we need
      if (account) token.accessToken = account.access_token;
      if (profile && "login" in profile) {
        token.login = (profile as { login: string }).login;
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
