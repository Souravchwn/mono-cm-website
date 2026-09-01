"use client";

/**
 * Hero background, replacing BuildingScene3D — inspired by 21st.dev's
 * "Horizon Hero Section" (starfield/mountain-ridge/horizon-glow, full source
 * paywalled; built from its visible preview + dependency list). Deliberately
 * pure CSS/SVG, not a second Three.js scene — see design.md → "Hero: horizon
 * scene replaces the 3D building" for why. Colors are this site's own
 * emerald/cyan tokens, not the reference's literal blue/red — same "borrow
 * the technique, not the palette" rule already applied to the orbital
 * diagram and the community components pass.
 *
 * Three parallax layers (stars slowest, mountain mid, glow fastest) are
 * exposed via refs so HeroSection can drive them from its own existing
 * scroll-scrubbed timeline, rather than an independent ScrollTrigger — see
 * HeroSection.tsx's comment on why decorative layers inside a *pinned*
 * section must ride the section's own timeline.
 */
import type { RefObject } from "react";

// Deterministic, integer-only placement — no Math.random()/Math.sin(). This
// session hit real server/client hydration mismatches twice already from
// float-precision differences in trig-based positioning (see
// OrbitalDiagram.tsx); plain integer arithmetic has no such ambiguity.
const STAR_COUNT = 55;
const STARS = Array.from({ length: STAR_COUNT }, (_, i) => ({
  top: (i * 37) % 68, // keep stars in the sky band, above the ridge
  left: (i * 53) % 100,
  size: 1 + (i % 3),
  opacity: 0.25 + (i % 5) * 0.11,
}));

export function HorizonScene({
  starsRef,
  mountainRef,
  glowRef,
  reducedMotion,
}: {
  starsRef: RefObject<HTMLDivElement | null>;
  mountainRef: RefObject<HTMLDivElement | null>;
  glowRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
}) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Sky gradient base */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #0a0b0d 0%, #0c131a 55%, #0a0b0d 100%)" }}
      />

      {/* Starfield — slowest parallax layer */}
      <div ref={starsRef} className="absolute inset-0">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: reducedMotion ? s.opacity * 0.7 : s.opacity,
            }}
          />
        ))}
      </div>

      {/* Horizon glow — fastest parallax layer, sits behind the ridge */}
      <div
        ref={glowRef}
        className="absolute bottom-[26%] left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(52,211,153,0.32), rgba(34,211,238,0.12) 45%, transparent 70%)",
        }}
      />

      {/* Mountain ridge — mid parallax layer */}
      <div ref={mountainRef} className="absolute inset-x-0 bottom-0 h-[42vh]">
        <svg
          viewBox="0 0 1200 320"
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label="Mountain ridge silhouette against a starfield"
        >
          <polygon
            points="0,320 0,190 110,150 250,205 390,95 540,175 690,65 850,160 990,105 1140,190 1200,155 1200,320"
            fill="#0A0B0D"
          />
          <polyline
            points="0,190 110,150 250,205 390,95 540,175 690,65 850,160 990,105 1140,190 1200,155"
            fill="none"
            stroke="rgba(52,211,153,0.3)"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Fade back to solid at the bottom so page content below stays legible */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: "linear-gradient(180deg, transparent, #0A0B0D 88%)" }}
      />
    </div>
  );
}
