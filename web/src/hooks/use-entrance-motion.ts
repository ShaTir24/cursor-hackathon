"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Options = {
  y?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
};

/**
 * Fade/slide-in for a scoped container. Skips when prefers-reduced-motion.
 */
export function useEntranceMotion(
  selector = "[data-motion]",
  options: Options = {},
) {
  const scope = useRef<HTMLDivElement>(null);
  const { y = 12, duration = 0.2, stagger = 0.06, delay = 0 } = options;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { reduce } = context.conditions ?? {};
          if (reduce) return;
          const targets = gsap.utils.toArray<HTMLElement>(selector, scope.current);
          if (!targets.length) return;
          // fromTo (not from): React Strict Mode remount can interrupt a from-tween
          // and leave later stagger targets stuck at autoAlpha 0 (invisible Teacher card).
          gsap.fromTo(
            targets,
            { autoAlpha: 0, y },
            {
              autoAlpha: 1,
              y: 0,
              duration,
              stagger,
              delay,
              ease: "power2.out",
              clearProps: "transform,opacity,visibility",
              overwrite: "auto",
            },
          );
        },
      );
      return () => mm.revert();
    },
    { scope },
  );

  return scope;
}
