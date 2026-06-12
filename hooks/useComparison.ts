"use client";

// Comparison state lives in a context (components/providers.tsx) because the
// tray and every repo card share it; re-exported here so consumers import hooks
// from one place.
export { useComparison } from "@/components/providers";
