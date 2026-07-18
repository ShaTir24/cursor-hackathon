"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_PROMPT = 8000;

type Props = {
  /** Used as the workspace owner for the Cursor CLI agent. */
  username: string;
  placeholder?: string;
};

/**
 * Prompt box that hands off to /create, where the video-creation SSE stream
 * (Cursor CLI agent) is rendered live.
 */
export function CreateWithAI({ username, placeholder }: Props) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const trimmed = prompt.trim();
  const canSubmit = trimmed.length > 0;

  function launch() {
    if (!canSubmit) return;
    const job =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());
    try {
      sessionStorage.setItem(
        `vc:${job}`,
        JSON.stringify({ prompt: trimmed.slice(0, MAX_PROMPT), username }),
      );
    } catch {
      // sessionStorage unavailable — fall back to query param below.
    }
    router.push(`/create?job=${job}&prompt=${encodeURIComponent(trimmed.slice(0, 1500))}`);
  }

  return (
    <section
      data-motion
      className="space-y-3 rounded-xl border border-border/80 bg-card/90 p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Wand2 className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg tracking-tight">
            Create with a prompt
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe the reel you want. We&apos;ll run the Cursor agent and
            stream its progress live.
          </p>
        </div>
      </div>

      <textarea
        data-testid="ai-prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") launch();
        }}
        maxLength={MAX_PROMPT}
        rows={4}
        placeholder={
          placeholder ??
          "e.g. A 30-second reel explaining the water cycle for a 12-year-old, with fun visuals."
        }
        className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {trimmed.length}/{MAX_PROMPT} · ⌘/Ctrl + Enter to run
        </span>
        <Button
          data-testid="ai-create-submit"
          onClick={launch}
          disabled={!canSubmit}
          className="bg-primary transition-colors duration-150 hover:bg-[var(--primary-hover)]"
        >
          <Wand2 className="size-4" aria-hidden />
          Create with AI
        </Button>
      </div>
    </section>
  );
}
