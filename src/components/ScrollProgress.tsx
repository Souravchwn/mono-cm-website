"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll progress bar across the very top of the page — a thin emerald→cyan line
 * that fills left to right as the page is read, sitting above the header so it
 * reads as the page's own progress rather than part of the nav.
 *
 * Scroll reads are rAF-coalesced: this runs against six scroll-scrubbed GSAP
 * timelines and two WebGL scenes, so it must not add layout work per scroll
 * event. It scales an already-composited element (`transform: scaleX`) rather
 * than animating `width`, which would force layout on every frame.
 *
 * `aria-hidden` — it reports scroll position, which assistive tech already
 * conveys, and it isn't operable.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    function measure() {
      const bar = barRef.current;
      if (!bar) return;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const progress = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / scrollable));
      // Written straight to the node, not through React state: this fires on
      // every animation frame while scrolling, and a state update per frame
      // would queue a React render per frame on a page already running six
      // scroll-scrubbed GSAP timelines and two WebGL scenes.
      bar.style.transform = `scaleX(${progress})`;
    }

    function onScroll() {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      // z-50 so it sits above the header (z-40) — the line belongs to the page,
      // not inside the nav bar.
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px]"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left"
        style={{
          transform: "scaleX(0)",
          background: "linear-gradient(90deg, var(--color-accent-bright), var(--color-cyan))",
          boxShadow: "0 0 12px -1px rgba(52,211,153,0.75)",
        }}
      />
    </div>
  );
}
