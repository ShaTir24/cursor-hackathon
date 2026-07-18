"use client";

import { cn } from "@/lib/utils";

type ChipProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testId?: string;
};

export function Chip({ active, onClick, children, testId }: ChipProps) {
  return (
    <button
      type="button"
      role="button"
      aria-pressed={active}
      data-testid={testId}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm outline-none transition-colors duration-150",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-primary bg-accent text-accent-foreground"
          : "border-border bg-card text-foreground hover:border-primary/50",
      )}
    >
      {children}
    </button>
  );
}
