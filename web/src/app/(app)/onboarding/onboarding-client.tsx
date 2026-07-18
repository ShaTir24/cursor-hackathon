"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCatalogue, submitOnboarding } from "@/lib/api";
import type { CatalogueItem } from "@/lib/types";
import { Chip } from "@/components/onboarding/chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
        setTopics(c.topics);
        setInterests(c.interests);
      })
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  async function onSubmit() {
    setError(null);
    const name = displayName.trim();
    if (!name) {
      setError("Enter a display name");
      return;
    }
    setSaving(true);
    try {
      if (role === "student") {
        if (selectedTopics.length < 2 || selectedInterests.length < 2) {
          throw new Error("Pick at least 2 topics and 2 interests");
        }
        await submitOnboarding({
          role: "student",
          displayName: name,
          ageGroup,
          topicIds: selectedTopics,
          interestIds: selectedInterests,
        });
      } else {
        if (selectedTopics.length < 1 || gradeBands.length < 1) {
          throw new Error("Pick at least 1 subject and 1 grade band");
        }
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
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-in fade-in duration-200 space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="font-display text-3xl tracking-tight">
          {role === "teacher" ? "Teacher setup" : "Student setup"}
        </h1>
        <Badge variant="secondary" className="capitalize">
          {role}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          value={displayName}
          placeholder="Your name"
          onChange={(e) => setDisplayName(e.target.value)}
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

      <div className="space-y-2">
        <Label>
          {role === "teacher" ? "Subjects (min 1)" : "Topics (min 2)"}
        </Label>
        <div className="flex flex-wrap gap-2">
          {topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">No catalogue topics yet.</p>
          ) : (
            topics.map((t) => (
              <Chip
                key={t.id}
                testId={`chip-topic-${t.slug}`}
                active={selectedTopics.includes(t.id)}
                onClick={() => setSelectedTopics(toggle(selectedTopics, t.id))}
              >
                {t.label}
              </Chip>
            ))
          )}
        </div>
      </div>

      {role === "student" ? (
        <div className="space-y-2">
          <Label>Interests (min 2)</Label>
          <div className="flex flex-wrap gap-2">
            {interests.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No catalogue interests yet.
              </p>
            ) : (
              interests.map((i) => (
                <Chip
                  key={i.id}
                  testId={`chip-interest-${i.slug}`}
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
      ) : (
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

      <Button
        data-testid="onboarding-submit"
        onClick={() => void onSubmit()}
        disabled={saving}
        className="bg-primary transition-colors duration-150 hover:bg-[var(--primary-hover)]"
      >
        {saving ? "Saving…" : "Save profile"}
      </Button>
    </div>
  );
}
