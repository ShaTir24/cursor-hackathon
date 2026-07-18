"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Home, LogOut, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { EduReelsLogo } from "@/components/brand/edu-reels-logo";
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
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const initials =
    profile?.displayName?.slice(0, 2).toUpperCase() ??
    profile?.role?.slice(0, 2).toUpperCase() ??
    "ER";

  const complete = Boolean(profile?.onboardingComplete && profile?.role);
  const isTeacher = profile?.role === "teacher";
  const modeLabel = isTeacher ? "Teach" : "Learn";
  const modeHint = isTeacher
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
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="gap-3 px-3 py-4">
          <Link
            href={complete ? "/home" : "/role"}
            className="flex items-center gap-2 px-1 transition-opacity duration-150 hover:opacity-90"
          >
            <EduReelsLogo
              size="sm"
              withWordmark
              className="group-data-[collapsible=icon]:[&>span:last-child]:hidden"
            />
          </Link>
          {complete && (
            <div className="space-y-1.5 px-1 group-data-[collapsible=icon]:hidden">
              <Badge
                variant="secondary"
                className="border border-primary/20 bg-accent font-semibold tracking-wide text-accent-foreground"
              >
                {modeLabel}
              </Badge>
              <p className="text-xs leading-snug text-muted-foreground">
                {modeHint}
              </p>
            </div>
          )}
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>
              {complete ? "Workspace" : "Get started"}
            </SidebarGroupLabel>
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
        <SidebarFooter className="gap-2 border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg bg-accent/50 p-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0">
            <Avatar className="size-9 ring-2 ring-primary/15">
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-medium leading-tight">
                {profile?.displayName ?? "Signed in"}
              </p>
              {profile?.role && (
                <p className="mt-0.5 truncate text-xs capitalize text-muted-foreground">
                  {profile.role}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start transition-colors duration-150"
            onClick={() => void signOut()}
          >
            <LogOut className="size-4" />
            <span className="group-data-[collapsible=icon]:hidden">Sign out</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="edu-mesh-inset">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-card/70 px-4 backdrop-blur-md">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mx-1 h-5" />
          {complete ? (
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {modeLabel}
              </span>
              <p className="truncate text-sm text-muted-foreground">{modeHint}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Finish setup to personalize your workspace
            </p>
          )}
        </header>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
