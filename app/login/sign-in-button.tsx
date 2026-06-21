"use client";

import { signIn } from "next-auth/react";
import { GitHubIcon } from "@/components/icons";

export const SignInButton = () => (
  <button
    type="button"
    onClick={() => signIn("github", { callbackUrl: "/" })}
    // Neutral surface with white label + accent GitHub mark — echoes the
    // white+accent wordmark and keeps high contrast on every theme (white on a
    // bright accent fill would fail WCAG, so we don't fill with the accent here)
    className="inline-flex items-center gap-2.5 rounded-lg border border-background-tertiary bg-background-secondary px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-text-muted hover:bg-background-tertiary"
  >
    <GitHubIcon className="h-5 w-5 text-accent-violet" />
    Sign in with GitHub
  </button>
);
