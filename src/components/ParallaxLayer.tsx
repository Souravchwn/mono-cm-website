"use client";

import type { CSSProperties } from "react";
import { useParallax } from "@/lib/use-parallax";

/**
 * Drops a parallax-scrubbed decorative element into an otherwise server
 * component section without converting the whole section to a client
 * component — same pattern as Reveal/DemoDataBadge/AnimatedForecastChart.
 * Decorative only (glow orbs, texture) — never used for real content, hence
 * the hardcoded aria-hidden.
 */
export function ParallaxLayer({
  speed,
  zoom = 0,
  className = "",
  style,
}: {
  speed: number;
  /** Optional scale-up over the scrub range — see use-parallax.ts. */
  zoom?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useParallax<HTMLDivElement>(speed, zoom);
  return <div ref={ref} aria-hidden="true" className={className} style={style} />;
}
