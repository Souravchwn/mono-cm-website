"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Shared pattern for every pinned scroll-scrubbed scene in context/storyboard.md:
 * an outer wrapper (sized 300-400vh by the caller) whose scroll progress drives a
 * single GSAP timeline. Sticky positioning (applied by the caller to the inner
 * viewport) handles the visual pinning, so ScrollTrigger only needs `scrub`, not
 * `pin` — this sidesteps GSAP pin's layout-shift quirks under React Strict Mode.
 *
 * When the visitor prefers reduced motion, `build` never runs — `staticState` runs
 * once instead, and should set the DOM directly to the scene's SCROLL 100% end-state.
 */
export function useScrollScene(
  build: (timeline: gsap.core.Timeline) => void,
  staticState?: () => void,
) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!wrapperRef.current) return;

      if (reducedMotion) {
        staticState?.();
        return;
      }

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
      build(timeline);
    },
    { scope: wrapperRef, dependencies: [reducedMotion] },
  );

  return wrapperRef;
}
