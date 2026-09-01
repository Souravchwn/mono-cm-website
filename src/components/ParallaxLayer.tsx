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
  className = "",
  style,
}: {
  speed: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useParallax<HTMLDivElement>(speed);
  return <div ref={ref} aria-hidden="true" className={className} style={style} />;
}
