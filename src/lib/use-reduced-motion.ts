"use client";

import { useEffect, useState } from "react";

/**
 * Every scroll-scrubbed scene (context/storyboard.md) must render its SCROLL 100%
 * end-state directly when this is true, per the "Reduced motion" section there.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window === "undefined"
      ? false
      : window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}
