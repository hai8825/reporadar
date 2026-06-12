"use client";

import { ApolloProvider } from "@apollo/client";
import { SessionProvider, useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createApolloClient } from "@/lib/apollo";
import type { ComparisonItem, RateLimitInfo } from "@/lib/types";

// ---- Rate limit context ----------------------------------------------------
// Hooks report rateLimit from every query result; the nav badge reads it here.

type RateLimitContextValue = {
  rateLimit: RateLimitInfo | null;
  reportRateLimit: (info: RateLimitInfo | null | undefined) => void;
};

const RateLimitContext = createContext<RateLimitContextValue | null>(null);

export const useRateLimit = (): RateLimitContextValue => {
  const ctx = useContext(RateLimitContext);
  if (!ctx) throw new Error("useRateLimit must be used within <Providers>");
  return ctx;
};

/**
 * Report a query's rateLimit payload as a side effect of `data` updates
 * (Apollo deprecated `onCompleted` for this).
 */
export const useReportRateLimit = (info: RateLimitInfo | null | undefined) => {
  const { reportRateLimit } = useRateLimit();
  useEffect(() => {
    reportRateLimit(info);
  }, [info, reportRateLimit]);
};

const RateLimitProvider = ({ children }: { children: React.ReactNode }) => {
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);

  const reportRateLimit = useCallback(
    (info: RateLimitInfo | null | undefined) => {
      if (info) setRateLimit(info);
    },
    [],
  );

  const value = useMemo(
    () => ({ rateLimit, reportRateLimit }),
    [rateLimit, reportRateLimit],
  );

  return (
    <RateLimitContext.Provider value={value}>
      {children}
    </RateLimitContext.Provider>
  );
};

// ---- Comparison context ----------------------------------------------------
// Up to 2 repos staged for /compare; the tray and card buttons share this.

type ComparisonContextValue = {
  staged: ComparisonItem[];
  isStaged: (id: string) => boolean;
  canStage: boolean;
  toggleStaged: (item: ComparisonItem) => void;
  clearStaged: () => void;
};

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

export const useComparison = (): ComparisonContextValue => {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error("useComparison must be used within <Providers>");
  return ctx;
};

const MAX_STAGED = 2;

const ComparisonProvider = ({ children }: { children: React.ReactNode }) => {
  const [staged, setStaged] = useState<ComparisonItem[]>([]);

  const value = useMemo<ComparisonContextValue>(
    () => ({
      staged,
      isStaged: (id) => staged.some((item) => item.id === id),
      canStage: staged.length < MAX_STAGED,
      toggleStaged: (item) =>
        setStaged((prev) => {
          if (prev.some((s) => s.id === item.id)) {
            return prev.filter((s) => s.id !== item.id);
          }
          return prev.length < MAX_STAGED ? [...prev, item] : prev;
        }),
      clearStaged: () => setStaged([]),
    }),
    [staged],
  );

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

// ---- Apollo ------------------------------------------------------------------

const ApolloWrapper = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? "";

  // New client when the token changes (sign-out → sign-in shouldn't reuse a cache)
  const client = useMemo(() => createApolloClient(accessToken), [accessToken]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

// ---- Root provider stack -----------------------------------------------------

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <SessionProvider>
    <ApolloWrapper>
      <RateLimitProvider>
        <ComparisonProvider>{children}</ComparisonProvider>
      </RateLimitProvider>
    </ApolloWrapper>
  </SessionProvider>
);
