"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { bootstrapProfile } from "@/lib/api";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

/** Require Supabase session; bootstrap Nest profile; wrap AppShell. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      try {
        await bootstrapProfile();
      } catch {
        /* shell still usable; pages may show API errors */
      }
      setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Skeleton className="h-10 w-48" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
