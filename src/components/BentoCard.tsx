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
  featured = false,
  footer,
}: {
  title: string;
  tracks: string;
  icon: ReactNode;
  featured?: boolean;
  /** Optional closing line for the wide card, which has height to spare once
   *  its content is top-aligned. Restates the section's own thesis rather than
   *  introducing a metric — see context/data-integrity.md. */
  footer?: { value: string; label: string };
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
        background: featured
          ? "linear-gradient(160deg, var(--color-surface-2), var(--color-surface))"
          : "var(--color-surface)",
        boxShadow: active
          ? "0 0 0 1px rgba(52,211,153,0.4), 0 1px 0 rgba(255,255,255,0.05) inset, 0 30px 60px -22px rgba(16,185,129,0.35)"
          : "0 0 0 1px var(--color-border), 0 1px 0 rgba(255,255,255,0.03) inset",
      }}
      // `justify-between` used to push the icon and the title-block to opposite
      // ends of the card. With `grid-auto-rows:1fr` every card is the same
      // height, so on the wide (col-span-2) card — whose copy wraps to fewer
      // lines — that gap opened up and stranded its title at the bottom edge
      // while every narrow sibling read as top-aligned. Starting both at the
      // top makes the alignment identical at any card size; `footer` below
      // takes the freed space on the wide one.
      className={`flex h-full flex-col justify-start gap-3 rounded-xl p-6 transition-[transform,box-shadow] duration-200 ease-out`}
      data-active={active}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-[9px] text-accent-bright transition-shadow duration-200"
        style={{
          background: "linear-gradient(155deg, rgba(52,211,153,0.18), rgba(52,211,153,0.06))",
          boxShadow: active
            ? "0 0 0 1px var(--color-accent-bright), 0 0 32px rgba(52,211,153,0.22), 0 0 20px rgba(34,211,238,0.12)"
            : "0 0 0 1px rgba(52,211,153,0.2)",
        }}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-display text-[15px] font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-foreground-muted">{tracks}</p>
      </div>
      {footer && (
        <div className="mt-auto flex items-baseline gap-2 pt-4">
          <span className="font-display text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {footer.value}
          </span>
          <span className="text-xs text-foreground-muted">{footer.label}</span>
        </div>
      )}
    </div>
  );
}
