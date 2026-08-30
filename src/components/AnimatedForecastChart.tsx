"use client";

import { useEffect, useRef, useState } from "react";

const POINTS = [12, 18, 15, 24, 22, 30, 27, 34, 31, 40];
const WIDTH = 300;
const HEIGHT = 100;

function toPath(points: number[]) {
  const max = Math.max(...points);
  const step = WIDTH / (points.length - 1);
  return points
    .map((value, i) => {
      const x = i * step;
      const y = HEIGHT - (value / max) * (HEIGHT - 10) - 5;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

/** Illustrative-only forecast curve — see DemoDataBadge, always rendered alongside this. */
export function AnimatedForecastChart() {
  const pathRef = useRef<SVGPathElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = pathRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const length = 420; // approximate path length, generous upper bound for dash offset

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-24 w-full sm:h-32" aria-hidden="true">
      <path
        ref={pathRef}
        d={toPath(POINTS)}
        fill="none"
        stroke="var(--color-accent-bright)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: length,
          strokeDashoffset: visible ? 0 : length,
          transition: "stroke-dashoffset 1200ms ease",
        }}
      />
    </svg>
  );
}
