"use client";

import { Suspense } from "react";
import OnboardingPage from "./onboarding-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl">
          <Skeleton className="h-10 w-64" />
        </div>
      }
    >
      <OnboardingPage />
    </Suspense>
  );
}
