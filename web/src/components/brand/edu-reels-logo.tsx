import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Show wordmark beside the mark */
  withWordmark?: boolean;
  /** Hero-scale on marketing entry */
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { mark: "size-8", word: "text-lg" },
  md: { mark: "size-10", word: "text-xl" },
  lg: { mark: "size-14", word: "text-4xl md:text-5xl" },
};

/**
 * EduReels mark: film reel hub + leaf accent (growth / learning).
 */
export function EduReelsLogo({
  className,
  withWordmark = true,
  size = "md",
}: Props) {
  const s = sizes[size];
  return (
    <span
      className={cn("inline-flex items-center gap-2.5 text-foreground", className)}
    >
      <svg
        className={cn(s.mark, "shrink-0 text-primary")}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={withWordmark}
        role={withWordmark ? undefined : "img"}
        aria-label={withWordmark ? undefined : "EduReels"}
      >
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="10"
          className="fill-primary"
        />
        <circle cx="20" cy="20" r="9" className="fill-primary-foreground/15" />
        <circle cx="20" cy="20" r="3.5" className="fill-primary-foreground" />
        <circle cx="12" cy="12" r="2" className="fill-primary-foreground/90" />
        <circle cx="28" cy="12" r="2" className="fill-primary-foreground/90" />
        <circle cx="12" cy="28" r="2" className="fill-primary-foreground/90" />
        <circle cx="28" cy="28" r="2" className="fill-primary-foreground/90" />
        <path
          d="M29.5 8.5c2.2 1.4 3.2 3.8 2.4 6.1-1.8-.2-3.4-1.2-4.4-2.8.6-1.4 1.4-2.5 2-3.3z"
          className="fill-[#E8F5EF]"
        />
      </svg>
      {withWordmark && (
        <span
          className={cn(
            "font-display font-semibold tracking-tight text-foreground",
            s.word,
          )}
        >
          EduReels
        </span>
      )}
    </span>
  );
}
