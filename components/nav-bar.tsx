"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useRateLimit } from "./providers";
import { ThemeSwitcher } from "./theme-switcher";
import { formatDate } from "@/lib/utils/format";

const NAV_LINKS = [
  { href: "/", label: "Discover" },
  { href: "/collection", label: "Collection" },
] as const;

const RATE_LIMIT_WARN_THRESHOLD = 1000;

const RateLimitBadge = () => {
  const { rateLimit } = useRateLimit();

  // Subtle warning only when we're actually burning down the quota
  if (!rateLimit || rateLimit.remaining >= RATE_LIMIT_WARN_THRESHOLD) return null;

  return (
    <span
      className="rounded-full border border-accent-violet-border bg-accent-violet-muted px-2.5 py-1 font-mono text-xs text-accent-violet"
      title={`Rate limit resets ${formatDate(rateLimit.resetAt)}`}
    >
      {rateLimit.remaining} API calls left
    </span>
  );
};

export const NavBar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  // The login page stands alone — no chrome
  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-40 border-b border-accent-violet-border border-b-[0.5px] bg-background-primary/95 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="text-lg">
          <span className="font-display font-normal text-text-primary">Repo</span>
          <span className="font-display font-semibold text-accent-violet">Radar</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                pathname === href
                  ? "bg-accent-violet-muted text-accent-violet"
                  : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <RateLimitBadge />
          <ThemeSwitcher />
          {session?.user && (
            <>
              <span className="hidden text-sm text-text-secondary sm:inline">
                {session.user.login || session.user.name}
              </span>
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element -- avatar from github, fixed size
                <img
                  src={session.user.image}
                  alt=""
                  className="h-7 w-7 rounded-full border border-accent-violet-border"
                />
              )}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm text-text-muted hover:text-text-primary"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
