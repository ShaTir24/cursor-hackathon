"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, Presentation } from "lucide-react";
import { useEntranceMotion } from "@/hooks/use-entrance-motion";
import { cn } from "@/lib/utils";

/**
 * Equal-weight persona choice. Motion only on header — cards stay fully opaque.
 */
export default function RolePage() {
  const router = useRouter();
  const scope = useEntranceMotion("[data-motion]", { y: 12, duration: 0.18 });

  return (
    <div ref={scope} className="mx-auto max-w-3xl space-y-10">
      <div data-motion>
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          How will you use EduReels?
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          We personalize generation for how you learn or teach. You can change
          this later in profile setup.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Choose your role"
        className="grid gap-4 sm:grid-cols-2"
      >
        <button
          type="button"
          role="radio"
          aria-checked={false}
          data-testid="role-student"
          className={cn(
            "group flex min-h-[11rem] flex-col items-start gap-4 rounded-xl border-2 border-border bg-card p-6 text-left",
            "transition-colors duration-150 hover:border-primary hover:bg-accent/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          onClick={() => router.push("/onboarding?role=student")}
        >
          <span className="flex size-12 items-center justify-center rounded-lg bg-accent text-primary">
            <GraduationCap className="size-7" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-xl tracking-tight">Student</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Pick topics and interests. Get a personalized learn reel.
            </p>
          </div>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={false}
          data-testid="role-teacher"
          className={cn(
            "group flex min-h-[11rem] flex-col items-start gap-4 rounded-xl border-2 border-border bg-card p-6 text-left",
            "transition-colors duration-150 hover:border-primary hover:bg-accent/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          onClick={() => router.push("/onboarding?role=teacher")}
        >
          <span className="flex size-12 items-center justify-center rounded-lg bg-accent text-primary">
            <Presentation className="size-7" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-xl tracking-tight">Teacher</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Set subjects and grade bands. Get a demo video plus lesson pack.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
