"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Lightweight scroll-scrubbed parallax for decorative background elements in
 * normal-flow (non-pinned) sections — glow orbs, ghost wordmarks. Deliberately
 * NOT built on a smooth-scroll library (Lenis, etc.): this site's storyboard
 * gate (see CLAUDE.md) is built entirely on native-scroll-driven GSAP
 * ScrollTrigger timelines pinning full sections (Hero, 02, 03, 09) — a global
 * smooth-scroll layer would fight the pin math on every one of those. Plain
 * ScrollTrigger scrubbing a single element's own transform has no such
 * conflict, since it never touches how the page itself scrolls.
 *
 * `speed` > 0 moves the element down relative to scroll (slower than
 * content); < 0 moves it up (faster) — small magnitudes only (0.1–0.3),
 * this is meant to read as depth, not as its own animation.
 */
export function useParallax<T extends HTMLElement>(speed: number) {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current || reducedMotion) return;

      gsap.to(ref.current, {
        yPercent: speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { dependencies: [reducedMotion] },
  );

  return ref;
}
