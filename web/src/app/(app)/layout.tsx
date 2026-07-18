"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_DEV_BYPASS, hasDevSession } from "@/lib/auth-dev";
import { createClient } from "@/lib/supabase/client";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (AUTH_DEV_BYPASS) {
      if (!hasDevSession()) {
        router.replace("/login");
        return;
      }
      setReady(true);
      return;
    }

    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setReady(true);
    });

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
