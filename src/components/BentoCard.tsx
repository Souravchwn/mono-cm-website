"use client";

import { useRef, useState, type ReactNode } from "react";

const MAX_TILT_DEG = 5;

/**
 * design.md: "premium + technical + controlled — not gaming website." Tilt is
 * capped at MAX_TILT_DEG on purpose; resist the urge to make this more dramatic.
 */
export function BentoCard({
  title,
  tracks,
  icon,
}: {
  title: string;
  tracks: string;
  icon: ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -MAX_TILT_DEG * 2, y: px * MAX_TILT_DEG * 2 });
  }

  function reset() {
    setTilt({ x: 0, y: 0 });
    setActive(false);
  }

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={reset}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(${active ? -4 : 0}px)`,
      }}
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-6 transition-[transform,box-shadow] duration-200 ease-out"
      data-active={active}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent-bright transition-shadow duration-200"
        style={
          active
            ? {
                boxShadow:
                  "0 0 0 1px var(--color-accent-bright), 0 0 32px rgba(52,211,153,0.22), 0 0 20px rgba(34,211,238,0.12)",
              }
            : undefined
        }
      >
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-foreground-muted">{tracks}</p>
    </div>
  );
}
