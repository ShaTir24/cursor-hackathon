"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EduReelsLogo } from "@/components/brand/edu-reels-logo";
import { AuthForm } from "@/components/auth/auth-form";
import { useEntranceMotion } from "@/hooks/use-entrance-motion";
import { Skeleton } from "@/components/ui/skeleton";

function LoginInner() {
  const params = useSearchParams();
  const mode =
    params.get("mode") === "signup" ? ("signup" as const) : ("signin" as const);
  const scope = useEntranceMotion("[data-motion]", { y: 14, duration: 0.2 });

  return (
    <div
      ref={scope}
      className="grid min-h-svh lg:grid-cols-2"
    >
      <div
        data-motion
        className="flex flex-col gap-6 p-6 md:p-10"
      >
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="transition-opacity duration-150 hover:opacity-90">
            <EduReelsLogo size="sm" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <AuthForm defaultMode={mode} />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground md:text-left">
          By continuing you agree to use EduReels for learning and teaching demos.
        </p>
      </div>

      <div
        data-motion
        className="edu-mesh relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center lg:p-12"
      >
        <div className="relative z-10 max-w-md">
          <EduReelsLogo size="lg" />
          <h2 className="mt-8 font-display text-3xl font-semibold tracking-tight text-foreground">
            Lessons that feel made for you
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Sign in to generate personalized educational reels for how you learn
            or teach — with a workspace built for real classrooms and curious
            minds.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center p-8">
          <Skeleton className="h-64 w-full max-w-sm" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
