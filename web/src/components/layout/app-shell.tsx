"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Home,
  LogOut,
  Settings2,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";
import { AUTH_DEV_BYPASS, clearDevSession } from "@/lib/auth-dev";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    void getMe()
      .then((r) => setProfile(r.profile))
      .catch(() => setProfile(null));
  }, [pathname]);

  async function signOut() {
    if (AUTH_DEV_BYPASS) {
      clearDevSession();
      router.replace("/login");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const initials =
    profile?.displayName?.slice(0, 2).toUpperCase() ??
    profile?.role?.slice(0, 2).toUpperCase() ??
    "ER";

  const complete = Boolean(profile?.onboardingComplete && profile?.role);
  const modeLabel = profile?.role === "teacher" ? "Teach" : "Learn";
  const modeHint =
    profile?.role === "teacher"
      ? "Class demos and lesson packs"
      : "Personalized learning reels";

  const primaryNav = complete
    ? [{ href: "/home", label: "Home", icon: Home }]
    : [
        { href: "/role", label: "Role", icon: Settings2 },
        { href: "/onboarding", label: "Setup", icon: BookOpen },
      ];

  const profileNav = complete
    ? [
        {
          href: `/onboarding?role=${profile?.role ?? "student"}`,
          label: "Profile setup",
          icon: Settings2,
        },
      ]
    : [];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="gap-2 px-3 py-4">
          <Link href="/home" className="flex items-center gap-2 px-1">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Video className="size-4" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="font-display text-lg leading-none tracking-tight">
                EduReels
              </span>
              <span className="text-xs text-muted-foreground">
                {complete ? `${modeLabel} workspace` : "Getting started"}
              </span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {primaryNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                      }
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          {profileNav.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {profileNav.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={pathname.startsWith("/onboarding")}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
        <SidebarFooter className="gap-2 p-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 group-data-[collapsible=icon]:justify-center">
            <Avatar className="size-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium">
                {profile?.displayName ?? "Signed in"}
              </p>
              {profile?.role && (
                <Badge variant="secondary" className="mt-0.5 capitalize">
                  {profile.role}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => void signOut()}
          >
            <LogOut className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b border-border bg-card/80 px-4 backdrop-blur-sm">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-1 h-5" />
          {complete ? (
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {modeLabel}
              </span>
              <p className="text-sm text-muted-foreground">{modeHint}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Finish setup to personalize your workspace
            </p>
          )}
        </header>
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
