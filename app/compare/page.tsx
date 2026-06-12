import { Suspense } from "react";
import { CompareClient } from "./compare-client";

export default function ComparePage() {
  return (
    <Suspense>
      <CompareClient />
    </Suspense>
  );
}
