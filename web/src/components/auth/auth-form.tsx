"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { bootstrapProfile } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

const signUpSchema = signInSchema
  .extend({
    confirmPassword: z.string().min(6, "At least 6 characters"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

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
      "Email rate limit exceeded. Wait a bit, or in Supabase Auth → Providers → Email " +
      "disable “Confirm email” for demos, then sign in with the account you created."
    );
  }
  if (lower.includes("email not confirmed")) {
    return (
      "Email not confirmed. Open the confirm link (must land on localhost:3001), " +
      "or turn off “Confirm email” in Supabase for hackathon demos."
    );
  }
  if (lower.includes("invalid") && lower.includes("credentials")) {
    return "Invalid email or password.";
  }
  if (lower.includes("user already registered")) {
    return "That email is already registered — switch to Sign in.";
  }
  return message;
}

export function AuthForm({
  className,
  defaultMode = "signin",
}: {
  className?: string;
  defaultMode?: "signin" | "signup";
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  async function enterApp() {
    const { profile } = await bootstrapProfile();
    router.replace(profile.onboardingComplete ? "/home" : "/role");
  }

  async function onSignIn(values: SignInValues) {
    setError(null);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (authError) throw authError;
      await enterApp();
    } catch (e) {
      setError(
        friendlyAuthError(e instanceof Error ? e.message : String(e)),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function onSignUp(values: SignUpValues) {
    setError(null);
    setCheckEmail(false);
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { emailRedirectTo: authRedirectTo() },
      });
      if (authError) throw authError;
      if (data.session) {
        toast.success("Account created");
        await enterApp();
        return;
      }
      setCheckEmail(true);
      toast.message("Check your email to confirm, then sign in.");
    } catch (e) {
      setError(
        friendlyAuthError(e instanceof Error ? e.message : String(e)),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cn("flex w-full flex-col gap-6", className)}>
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v as "signin" | "signup");
          setError(null);
          setCheckEmail(false);
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="signin"
            data-testid="auth-mode-signin"
            className="cursor-pointer"
          >
            Sign in
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            data-testid="auth-mode-signup"
            className="cursor-pointer"
          >
            Create account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="mt-6 space-y-4">
          <div>
            <h1 className="font-display text-2xl tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to continue to your EduReels workspace.
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={signInForm.handleSubmit((v) => void onSignIn(v))}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                autoComplete="email"
                data-testid="auth-email"
                {...signInForm.register("email")}
              />
              {signInForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {signInForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative">
                <Input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  data-testid="auth-password"
                  className="pr-10"
                  {...signInForm.register("password")}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {signInForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {signInForm.formState.errors.password.message}
                </p>
              )}
            </div>
            {error && mode === "signin" && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              data-testid="auth-submit"
              className="w-full bg-primary transition-colors duration-150 hover:bg-[var(--primary-hover)]"
              disabled={submitting}
            >
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="mt-6 space-y-4">
          <div>
            <h1 className="font-display text-2xl tracking-tight">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Start learning or teaching with personalized reels.
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={signUpForm.handleSubmit((v) => void onSignUp(v))}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                data-testid="auth-email"
                {...signUpForm.register("email")}
              />
              {signUpForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {signUpForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  data-testid="auth-password"
                  className="pr-10"
                  {...signUpForm.register("password")}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {signUpForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {signUpForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-confirm">Confirm password</Label>
              <Input
                id="signup-confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                data-testid="auth-password-confirm"
                {...signUpForm.register("confirmPassword")}
              />
              {signUpForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {signUpForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            {error && mode === "signup" && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {checkEmail && (
              <Alert>
                <AlertDescription>
                  Check your inbox to confirm your email, then sign in. For
                  demos, disable “Confirm email” in Supabase Auth settings.
                </AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              data-testid="auth-submit"
              className="w-full bg-primary transition-colors duration-150 hover:bg-[var(--primary-hover)]"
              disabled={submitting}
            >
              {submitting ? "Creating…" : "Create account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
