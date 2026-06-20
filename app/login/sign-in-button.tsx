"use client";

import { signIn } from "next-auth/react";
import { GitHubIcon } from "@/components/icons";

export const SignInButton = () => (
  <button
    type="button"
    onClick={() => signIn("github", { callbackUrl: "/" })}
    className="inline-flex items-center gap-2.5 rounded-lg bg-accent-violet px-5 py-2.5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-violet/90"
  >
    <GitHubIcon className="h-5 w-5" />
    Sign in with GitHub
  </button>
);
