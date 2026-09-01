"use client";

/**
 * Waitlist section backdrop — replaces the flat isometric "ground" grid that
 * used to sit under BuildingScene3D (Three.js `gridHelper`, removed
 * 2026-09-01: user flagged it directly, screenshot-annotated, as a stray
 * floor plane with no purpose). Same technique the Hero's original CSS/SVG
 * backdrop used (that component is since deleted — the Hero now runs a real
 * Three.js scene, `HorizonFlythroughScene.tsx`, see design.md), reused here
 * per the user's explicit ask for "the same animation" plus "an extra
 * scene, something meaningful": a skyline silhouette instead of a mountain
 * ridge, meaningfully bookending the Hero's night-sky scene with "the
 * skyline now standing" — same visual grammar (glow + silhouette +
 * drifting particles), different subject, matching this section's own "the
 * future of construction, built" copy.
 *
 * Unlike the Hero's backdrop, this is NOT locked to a fixed dark palette —
 * the Waitlist section is normal document flow and follows the light/dark
 * theme toggle (see design.md → "Light theme: Hero, parallax, and the
 * waitlist/footer scroll"), so every layer here is built from theme tokens
 * (`var(--foreground)`, `--glow-*`) rather than literal hex, the same
 * technique `.bg-blueprint-grid` already uses to stay legible in both
 * themes without a separate light-mode value.
 *
 * Parallax + zoom drive off `useParallax` (each layer its own scrub-tied
 * ScrollTrigger, safe here since this section is no longer pinned) rather
 * than a single shared timeline — a *pinned* section can't do this (see
 * `HorizonFlythroughScene.tsx`'s header for why), but this section isn't
 * pinned anymore.
 */
import { useParallax } from "@/lib/use-parallax";
import { hash01 } from "@/lib/hash01";

// Deterministic, integer-only skyline + particle placement — no
// Math.random()/Math.sin(). This codebase hit real server/client hydration
// mismatches twice from float-precision differences in trig-based
// positioning before adopting this rule everywhere.
const BUILDING_COUNT = 14;
const BUILDINGS = Array.from({ length: BUILDING_COUNT }, (_, i) => ({
  left: (i * 100) / BUILDING_COUNT,
  width: 100 / BUILDING_COUNT + 1.5,
  height: 18 + ((i * 29) % 46), // 18–64% of the skyline band
}));

// Windows — flat solid silhouettes read as "programmer-art blocks" up close
// (same lesson learned building the Hero's `HorizonFlythroughScene`). A small
// per-building window grid, roughly half lit, fixes that without switching
// this scene off its lightweight SVG technique.
//
// Lit/unlit *and* per-window brightness both come from `hash01`. The first
// version used `(cellIndex * 7 + buildingIndex * 5) % 10 < 4` — deterministic,
// but periodic, and the repeat was plainly visible as a regular stripe across
// the skyline ("it seems like it just loops"). Real city windows have no
// pattern; a hash has none either, while still being SSR-stable.
function windowGrid(buildingIndex: number, cols: number, rows: number) {
  return Array.from({ length: cols * rows }, (_, cellIndex) => {
    const seed = buildingIndex * 977 + cellIndex * 31;
    return {
      col: cellIndex % cols,
      row: Math.floor(cellIndex / cols),
      lit: hash01(seed) < 0.45,
      // Varying brightness matters as much as varying which ones are on —
      // a grid of identically-bright squares reads as a texture, not windows.
      opacity: 0.32 + hash01(seed + 7) * 0.45,
    };
  });
}

const PARTICLE_COUNT = 18;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  left: (i * 43) % 100,
  bottom: 4 + ((i * 17) % 30),
  size: 2 + (i % 3),
  opacity: 0.25 + (i % 4) * 0.12,
}));

export function SkylineHorizonScene() {
  const glowRef = useParallax<HTMLDivElement>(0.16, 0.4);
  const skylineRef = useParallax<HTMLDivElement>(0.08, 0.14);
  const particlesRef = useParallax<HTMLDivElement>(-0.22);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        ref={glowRef}
        className="absolute bottom-0 left-1/2 h-[26rem] w-[42rem] -translate-x-1/2 rounded-full blur-[90px]"
        style={{ background: "var(--glow-emerald)", transformOrigin: "50% 100%" }}
      />

      <div ref={skylineRef} className="absolute inset-x-0 bottom-0 h-[38%]" style={{ transformOrigin: "50% 100%" }}>
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-full w-full" role="presentation">
          {BUILDINGS.map((b, i) => {
            const y = 60 - b.height * 0.6;
            const h = b.height * 0.6;
            const cols = 3;
            const rows = Math.max(2, Math.round(h / 3));
            const pad = b.width * 0.12;
            const cellW = (b.width - pad * 2) / cols;
            const cellH = (h - pad * 2) / rows;
            return (
              <g key={i}>
                <rect x={b.left} y={y} width={b.width} height={h} fill="var(--foreground)" opacity={0.07} />
                {windowGrid(i, cols, rows).map(({ col, row, lit, opacity }) =>
                  lit ? (
                    <rect
                      key={`${col}-${row}`}
                      x={b.left + pad + col * cellW}
                      y={y + pad + row * cellH}
                      width={Math.max(cellW - pad, 0.3)}
                      height={Math.max(cellH - pad, 0.3)}
                      fill="var(--accent-bright)"
                      opacity={opacity}
                    />
                  ) : null,
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div ref={particlesRef} className="absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-accent-bright"
            style={{
              left: `${p.left}%`,
              bottom: `${p.bottom}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
}
