"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, Presentation } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RolePage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in duration-200 space-y-6">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Choose your role</h1>
        <p className="mt-2 text-muted-foreground">
          We personalize generation for how you learn or teach.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          data-testid="role-student"
          className="text-left transition-all duration-200 hover:-translate-y-0.5 motion-reduce:transform-none"
          onClick={() => router.push("/onboarding?role=student")}
        >
          <Card className="h-full border-border transition-colors duration-150 hover:border-primary hover:bg-accent/40">
            <CardHeader>
              <GraduationCap className="mb-2 size-8 text-primary" />
              <CardTitle>Student</CardTitle>
              <CardDescription>
                Pick topics and interests. Get a personalized learn reel.
              </CardDescription>
            </CardHeader>
          </Card>
        </button>
        <button
          type="button"
          data-testid="role-teacher"
          className="text-left transition-all duration-200 hover:-translate-y-0.5 motion-reduce:transform-none"
          onClick={() => router.push("/onboarding?role=teacher")}
        >
          <Card className="h-full border-border transition-colors duration-150 hover:border-primary hover:bg-accent/40">
            <CardHeader>
              <Presentation className="mb-2 size-8 text-primary" />
              <CardTitle>Teacher</CardTitle>
              <CardDescription>
                Set subjects and grade bands. Get a demo video plus lesson pack.
              </CardDescription>
            </CardHeader>
          </Card>
        </button>
      </div>
    </div>
  );
}
