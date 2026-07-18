"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { bootstrapProfile } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Supabase email-confirm / magic-link return URL.
 * Must match Auth → URL Configuration → Redirect URLs (e.g. http://localhost:3001/auth/callback).
 * Site URL must be the Next app (:3001), NOT the Nest API (:3000).
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const supabase = createClient();
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const hashError = new URLSearchParams(url.hash.replace(/^#/, "")).get(
          "error_description",
        );

        if (hashError) {
          throw new Error(decodeURIComponent(hashError.replace(/\+/g, " ")));
        }

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        } else {
          // Implicit / hash tokens — detectSessionInUrl on the client
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (!data.session) {
            throw new Error(
              "No session after confirm. Open http://localhost:3001/login and sign in, or set Supabase Site URL to http://localhost:3001 and try a fresh confirmation email.",
            );
          }
        }

        const { profile } = await bootstrapProfile();
        if (cancelled) return;
        router.replace(profile.onboardingComplete ? "/home" : "/role");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      {!error ? (
        <>
          <Skeleton className="h-8 w-56" />
          <p className="text-sm text-muted-foreground">Confirming your email…</p>
        </>
      ) : (
        <Alert variant="destructive" className="max-w-lg">
          <AlertDescription className="space-y-2">
            <p>{error}</p>
            <p className="text-sm opacity-90">
              Fix: Supabase → Authentication → URL Configuration → Site URL ={" "}
              <code className="rounded bg-muted px-1">http://localhost:3001</code>
              , add Redirect URL{" "}
              <code className="rounded bg-muted px-1">
                http://localhost:3001/auth/callback
              </code>
              . Or disable “Confirm email” for hackathon demos.
            </p>
            <a href="/login" className="text-sm font-medium underline">
              Back to login
            </a>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
