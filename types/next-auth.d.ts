import type { DefaultSession } from "next-auth";

// Augment NextAuth types with the GitHub token + login we stash in callbacks
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      login: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    login?: string;
  }
}
