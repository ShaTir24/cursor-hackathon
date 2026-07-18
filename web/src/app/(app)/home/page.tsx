"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { StudentHome } from "@/components/home/student-home";
import { TeacherHome } from "@/components/home/teacher-home";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getMe()
      .then((r) => {
        setProfile(r.profile);
        if (!r.profile.onboardingComplete) {
          router.replace("/role");
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [router]);

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!profile) {
    return <Skeleton className="h-40 w-full max-w-xl" />;
  }

  if (profile.role === "teacher") {
    return <TeacherHome profile={profile} />;
  }

  return <StudentHome profile={profile} />;
}
