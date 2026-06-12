import { Suspense } from "react";
import { DiscoveryClient } from "./discovery-client";

// useSearchParams in the client needs a Suspense boundary at the page level
export default function HomePage() {
  return (
    <Suspense>
      <DiscoveryClient />
    </Suspense>
  );
}
