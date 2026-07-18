"use client";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";
import { EduReelsLogo } from "@/components/brand/edu-reels-logo";
import { buttonVariants } from "@/components/ui/button";
import { useEntranceMotion } from "@/hooks/use-entrance-motion";
import { cn } from "@/lib/utils";

/**
 * Brand-first entry — CTAs to frozen /login. No secondary marketing chrome.
 */
export default function EntryPage() {
  const scope = useEntranceMotion("[data-motion]", { y: 16, duration: 0.22 });

  return (
    <main
      ref={scope}
      className="edu-mesh relative flex min-h-svh flex-col overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary/[0.04] to-transparent"
      />
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16 md:px-10">
        <div data-motion className="mb-12">
          <EduReelsLogo size="lg" />
        </div>

        <h1
          data-motion
          className="max-w-xl font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.1]"
        >
          Lessons that feel made for you
        </h1>
        <p
          data-motion
          className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          Sign in to generate personalized learning and teaching reels for how
          you learn or teach.
        </p>

        <div
          data-motion
          className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <Link
            href="/login"
            data-testid="entry-signin"
            className={cn(
              buttonVariants({ size: "lg" }),
              "bg-primary transition-colors duration-150 hover:bg-[var(--primary-hover)]",
            )}
          >
            <LogIn className="size-4" />
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            data-testid="entry-signup"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "border-border/80 bg-card/60 backdrop-blur-sm transition-colors duration-150",
            )}
          >
            <UserPlus className="size-4" />
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
