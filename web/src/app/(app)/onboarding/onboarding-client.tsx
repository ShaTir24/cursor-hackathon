"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { fetchCatalogue, submitOnboarding } from "@/lib/api";
import type { CatalogueItem } from "@/lib/types";
import { Chip } from "@/components/onboarding/chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";

const AGE_GROUPS = ["8-10", "11-13", "14-16", "17-18"] as const;

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export default function OnboardingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const rawRole = params.get("role");
  const role: "student" | "teacher" =
    rawRole === "teacher" || rawRole === "student" ? rawRole : "student";

  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [topics, setTopics] = useState<CatalogueItem[]>([]);
  const [interests, setInterests] = useState<CatalogueItem[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [ageGroup, setAgeGroup] = useState<string>("11-13");
  const [gradeBands, setGradeBands] = useState<string[]>(["11-13"]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCatalogue = useCallback(() => {
    setLoading(true);
    setError(null);
    void fetchCatalogue()
      .then((c) => {
        setTopics(c.topics ?? []);
        setInterests(c.interests ?? []);
      })
      .catch((e) => {
        setTopics([]);
        setInterests([]);
        setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  function topicLabel(id: string) {
    return topics.find((t) => t.id === id)?.label ?? id;
  }
  function interestLabel(id: string) {
    return interests.find((i) => i.id === id)?.label ?? id;
  }

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (!displayName.trim()) return "Enter a display name";
      return null;
    }
    if (current === 2) {
      if (role === "student") {
        if (selectedTopics.length < 2 || selectedInterests.length < 2) {
          return "Pick at least 2 topics and 2 interests";
        }
      } else if (selectedTopics.length < 1 || gradeBands.length < 1) {
        return "Pick at least 1 subject and 1 grade band";
      }
      return null;
    }
    return null;
  }

  function goNext() {
    setError(null);
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function onSubmit() {
    setError(null);
    const msg = validateStep(1) ?? validateStep(2);
    if (msg) {
      setError(msg);
      return;
    }
    const name = displayName.trim();
    setSaving(true);
    try {
      if (role === "student") {
        await submitOnboarding({
          role: "student",
          displayName: name,
          ageGroup,
          topicIds: selectedTopics,
          interestIds: selectedInterests,
        });
      } else {
        await submitOnboarding({
          role: "teacher",
          displayName: name,
          subjectIds: selectedTopics,
          gradeBands,
        });
      }
      router.replace("/home");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const steps = [
    { value: 1, title: "Profile", description: "Name & band" },
    {
      value: 2,
      title: role === "teacher" ? "Classroom" : "Focus",
      description: role === "teacher" ? "Subjects" : "Topics",
    },
    { value: 3, title: "Review", description: "Confirm" },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl tracking-tight">
          {role === "teacher" ? "Teacher setup" : "Student setup"}
        </h1>
        <Badge variant="secondary" className="capitalize">
          {role}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Three short steps. We save this to your EduReels profile.
      </p>

      <Stepper
        value={step}
        onValueChange={setStep}
        className="space-y-8"
        indicators={{
          completed: <Check className="size-3.5" strokeWidth={3} />,
        }}
      >
        <StepperNav className="gap-2">
          {steps.map((s, i) => (
            <StepperItem
              key={s.value}
              step={s.value}
              completed={step > s.value}
              className="flex-1"
            >
              <StepperTrigger className="w-full flex-col gap-2 rounded-lg p-2 sm:flex-row sm:items-center">
                <StepperIndicator>{s.value}</StepperIndicator>
                <div className="hidden text-left sm:block">
                  <StepperTitle>{s.title}</StepperTitle>
                  <StepperDescription>{s.description}</StepperDescription>
                </div>
              </StepperTrigger>
              {i < steps.length - 1 && (
                <StepperSeparator className="mx-2 hidden h-px flex-1 bg-border sm:block" />
              )}
            </StepperItem>
          ))}
        </StepperNav>

        <StepperPanel>
          <StepperContent value={1} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={displayName}
                placeholder="Your name"
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </div>
            {role === "student" && (
              <div className="space-y-2">
                <Label>Age group</Label>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map((g) => (
                    <Chip
                      key={g}
                      active={ageGroup === g}
                      onClick={() => setAgeGroup(g)}
                    >
                      {g}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
            {role === "teacher" && (
              <div className="space-y-2">
                <Label>Grade bands</Label>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map((g) => (
                    <Chip
                      key={g}
                      active={gradeBands.includes(g)}
                      onClick={() => setGradeBands(toggle(gradeBands, g))}
                    >
                      {g}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </StepperContent>

          <StepperContent value={2} className="space-y-6">
            <div className="space-y-2">
              <Label>
                {role === "teacher" ? "Subjects (min 1)" : "Topics (min 2)"}
              </Label>
              <div className="flex flex-wrap gap-2">
                {(topics ?? []).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No catalogue topics yet.
                  </p>
                ) : (
                  topics.map((t) => (
                    <Chip
                      key={t.id}
                      testId={`chip-topic-${t.slug ?? t.id}`}
                      active={selectedTopics.includes(t.id)}
                      onClick={() =>
                        setSelectedTopics(toggle(selectedTopics, t.id))
                      }
                    >
                      {t.label}
                    </Chip>
                  ))
                )}
              </div>
            </div>
            {role === "student" && (
              <div className="space-y-2">
                <Label>Interests (min 2)</Label>
                <div className="flex flex-wrap gap-2">
                  {(interests ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No catalogue interests yet.
                    </p>
                  ) : (
                    interests.map((i) => (
                      <Chip
                        key={i.id}
                        testId={`chip-interest-${i.slug ?? i.id}`}
                        active={selectedInterests.includes(i.id)}
                        onClick={() =>
                          setSelectedInterests(toggle(selectedInterests, i.id))
                        }
                      >
                        {i.label}
                      </Chip>
                    ))
                  )}
                </div>
              </div>
            )}
          </StepperContent>

          <StepperContent value={3} className="space-y-6">
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </p>
                <p className="mt-1 font-medium">
                  {displayName.trim() || "—"}
                </p>
              </div>
              {role === "student" ? (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Age group
                    </p>
                    <p className="mt-1">{ageGroup}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Topics
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedTopics.map((id) => (
                        <Badge key={id} variant="secondary">
                          {topicLabel(id)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Interests
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedInterests.map((id) => (
                        <Badge key={id} variant="outline">
                          {interestLabel(id)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Subjects
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedTopics.map((id) => (
                        <Badge key={id} variant="secondary">
                          {topicLabel(id)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Grade bands
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {gradeBands.map((g) => (
                        <Badge key={g} variant="outline">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </StepperContent>
        </StepperPanel>
      </Stepper>

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{error}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadCatalogue}
            >
              Retry catalogue
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={step === 1 || saving}
        >
          Back
        </Button>
        {step < 3 ? (
          <Button
            type="button"
            onClick={goNext}
            className="bg-primary transition-colors duration-150 hover:bg-[var(--primary-hover)]"
          >
            Continue
          </Button>
        ) : (
          <Button
            data-testid="onboarding-submit"
            onClick={() => void onSubmit()}
            disabled={saving}
            className="bg-primary transition-colors duration-150 hover:bg-[var(--primary-hover)]"
          >
            {saving ? "Saving…" : "Save profile"}
          </Button>
        )}
      </div>
    </div>
  );
}
