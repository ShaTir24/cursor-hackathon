"use client";

import type { Profile } from "@/lib/types";

export function RoleGate({
  profile,
  allow,
  children,
  fallback = null,
}: {
  profile: Profile | null;
  allow: Array<"student" | "teacher">;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (!profile?.role || !allow.includes(profile.role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
