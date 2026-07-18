"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { bootstrapProfile } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "At least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

function authRedirectTo() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/auth/callback`;
}

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("rate limit") ||
    lower.includes("429") ||
    lower.includes("email rate limit exceeded")
  ) {
    return (
      "Email rate limit exceeded (Supabase). Stop retrying signup for a bit. " +
      "Fastest fix: Authentication → Providers → Email → disable “Confirm email” " +
      "(no more confirmation emails). Then sign in with the account you already created, " +
      "or confirm the user under Authentication → Users."
    );
  }
  if (lower.includes("email not confirmed")) {
    return (
      "Email not confirmed. Open the Supabase confirm link (it must land on " +
      "localhost:3001, not :3000), or in Supabase Auth → Providers → Email turn off " +
      "“Confirm email” for hackathon demos."
    );
  }
  if (lower.includes("invalid") && lower.includes("credentials")) {
    return "Invalid email or password.";
  }
  if (lower.includes("user already registered")) {
    return "That email is already registered — switch to Sign in (or confirm the user in Supabase).";
  }
  return message;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function enterApp() {
    const { profile } = await bootstrapProfile();
    router.replace(profile.onboardingComplete ? "/home" : "/role");
  }

  async function onSubmit(values: FormValues) {
    setError(null);
    setCheckEmail(false);
    const supabase = createClient();
    try {
      if (mode === "signup") {
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
              emailRedirectTo: authRedirectTo(),
            },
          });
        if (signUpError) throw signUpError;

        // Confirm-email ON → no session until link clicked
        if (!signUpData.session) {
          setCheckEmail(true);
          toast.message("Check your email to confirm", {
            description:
              "Confirm link must open localhost:3001 (not :3000). Or disable Confirm email in Supabase.",
          });
          return;
        }

        toast.success("Account created");
        await enterApp();
        return;
      }

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
      if (signInError) throw signInError;
      if (!data.session) {
        throw new Error(
          "No session yet. Confirm your email, or disable email confirmation in Supabase.",
        );
      }

      await enterApp();
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      const message = friendlyAuthError(raw);
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#d8efe6_0%,_transparent_55%),linear-gradient(180deg,_#f7f4ef_0%,_#ebe4d8_100%)]"
      />
      <Card className="relative z-10 w-full max-w-md border-border/80 shadow-sm">
        <CardHeader className="space-y-2">
          <p className="font-display text-3xl tracking-tight text-primary">
            EduReels
          </p>
          <CardTitle className="text-xl font-normal text-foreground">
            {mode === "signin"
              ? "Sign in to your workspace"
              : "Create your account"}
          </CardTitle>
          <CardDescription>
            Personalized lessons for learners and teachers — generate, watch,
            and teach with EduReels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                data-testid="auth-email"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                data-testid="auth-password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>
            {checkEmail && (
              <Alert>
                <AlertDescription>
                  Account created. Confirm via the email link (lands on{" "}
                  <code className="text-xs">/auth/callback</code>), then sign
                  in. Fastest hackathon path: Supabase → Authentication →
                  Providers → Email → disable <strong>Confirm email</strong>.
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full transition-colors duration-150"
              data-testid="auth-submit"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Working…"
                : mode === "signin"
                  ? "Sign in"
                  : "Sign up"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              data-testid="auth-mode-toggle"
              onClick={() => {
                setMode((m) => (m === "signin" ? "signup" : "signin"));
                setError(null);
                setCheckEmail(false);
              }}
            >
              {mode === "signin"
                ? "Need an account? Sign up"
                : "Have an account? Sign in"}
            </Button>
            <details className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium text-foreground">
                Setup tip
              </summary>
              <p className="mt-2 leading-relaxed">
                Supabase Site URL must be{" "}
                <code className="rounded bg-card px-1">http://localhost:3001</code>
                . For demos, disable Confirm email under Authentication →
                Providers → Email.
              </p>
            </details>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
