"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "@/hooks/useTheme";
import { THEMES } from "@/lib/themes";
import { ChevronDownIcon, LogoutIcon } from "./icons";

// Single avatar-triggered menu that consolidates identity, theme, and sign-out.
// No modal (design rule) — button + transparent backdrop for outside-click.
export const AccountMenu = () => {
  const { data: session } = useSession();
  const [theme, setTheme] = useTheme();
  const [open, setOpen] = useState(false);

  const user = session?.user;
  if (!user) return null;

  const handle = user.login || user.name || "Account";
  const initials = handle.slice(0, 2).toUpperCase();

  // Avatar image when GitHub gives us one, initials fallback otherwise
  const Avatar = ({ size }: { size: string }) =>
    user.image ? (
      // eslint-disable-next-line @next/next/no-img-element -- avatar from github, fixed size
      <img
        src={user.image}
        alt=""
        className={`${size} rounded-full border border-accent-violet-border`}
      />
    ) : (
      <span
        className={`${size} flex items-center justify-center rounded-full border border-accent-violet-border bg-accent-violet-muted text-xs text-accent-violet`}
      >
        {initials}
      </span>
    );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${handle}`}
        className="flex items-center gap-1 rounded-full p-0.5 transition-colors hover:bg-background-tertiary"
      >
        <Avatar size="h-7 w-7" />
        <ChevronDownIcon className="h-3 w-3 text-text-muted" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border-[0.5px] border-accent-violet-border bg-background-secondary p-1.5 shadow-lg shadow-black/20"
          >
            {/* Identity header */}
            <div className="flex items-center gap-2.5 border-b-[0.5px] border-accent-violet-border px-2 pb-2.5 pt-1.5">
              <Avatar size="h-8 w-8" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{handle}</p>
                <p className="text-xs text-text-muted">Signed in</p>
              </div>
            </div>

            {/* Theme — swatches stay open on click so you can flip through them */}
            <p className="px-2 pb-1.5 pt-2.5 text-[11px] uppercase tracking-wide text-text-muted">
              Theme
            </p>
            <div className="flex gap-2 px-2 pb-1.5">
              {THEMES.map((t) => {
                const isActive = t.id === theme;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    aria-label={`${t.label} (${t.mode})`}
                    title={`${t.label} · ${t.mode}`}
                    onClick={() => setTheme(t.id)}
                    className={`flex h-6 w-6 items-center justify-center rounded-full border transition-transform hover:scale-110 ${
                      isActive
                        ? "border-accent-violet ring-2 ring-accent-violet/40"
                        : "border-accent-violet-border"
                    }`}
                    style={{ backgroundColor: t.swatch.bg }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: t.swatch.accent }}
                    />
                  </button>
                );
              })}
            </div>

            {/* Sign out */}
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-1 flex w-full items-center gap-2.5 border-t-[0.5px] border-accent-violet-border px-2 pb-1 pt-2.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <LogoutIcon className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
};
