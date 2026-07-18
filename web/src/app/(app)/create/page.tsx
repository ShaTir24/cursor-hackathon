import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateClient } from "./create-client";

export const dynamic = "force-dynamic";

export default function CreatePage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-3xl" />}>
      <CreateClient />
    </Suspense>
  );
}
