"use client";

import { useMemo } from "react";
import { gsap } from "@/lib/gsap";
import { useScrollScene } from "@/lib/use-scroll-scene";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { BuildingScene3D, createBuildingMaterials } from "@/components/scenes/BuildingScene3D";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  const floorMaterials = useMemo(() => createBuildingMaterials(), []);
  const topFloor = floorMaterials.length - 1;
  const reducedMotion = useReducedMotion();

  const wrapperRef = useScrollScene(
    (tl) => {
      const wires = floorMaterials.map((f) => f.wire);
      const solids = floorMaterials.map((f) => f.solid);

      // Per-floor stagger, bottom-to-top: wireframe (blueprint) reveals first,
      // then each floor solidifies — the same "blueprint -> completed building"
      // narrative as the old SVG version, just restructured around discrete
      // floor units instead of one shared frame/walls/roof stack.
      tl.to(wires, { opacity: 1, stagger: 0.15, duration: 0.3, ease: "none" }, 0)
        .to(
          solids,
          {
            opacity: (i: number) => (i === topFloor ? 0.85 : 0.1),
            emissiveIntensity: (i: number) => (i === topFloor ? 0.55 : 0.18),
            stagger: 0.15,
            duration: 0.3,
            ease: "none",
          },
          0.2,
        )
        // Steady glow on completion, not a pulse/flash — a scrub-tied flash on
        // something this small reads as a flicker under normal scroll jitter
        // (same lesson as the old GLOW stage, see context/tech-notes.md).
        .to(floorMaterials[topFloor].glow, { intensity: 1.1, duration: 0.25, ease: "none" }, 1.0);
    },
    () => {
      floorMaterials.forEach((f, i) => {
        gsap.set(f.wire, { opacity: 1 });
        gsap.set(f.solid, {
          opacity: i === topFloor ? 0.85 : 0.1,
          emissiveIntensity: i === topFloor ? 0.55 : 0.18,
        });
      });
      gsap.set(floorMaterials[topFloor].glow, { intensity: 1.1 });
    },
  );

  return (
    <section id="01-hero" aria-label="Hero">
      <div ref={wrapperRef} className="relative h-[200vh]">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-12 overflow-hidden border-b border-border px-8 sm:flex-row sm:px-16">
          <div className="flex max-w-lg flex-col items-start gap-6">
            <h1 className="text-hero font-display font-semibold text-balance text-foreground">
              The Production-Centric Construction Engine.
            </h1>
            <p className="text-body-lg max-w-md text-foreground-muted">
              One source of truth for every dollar, drawing, material, and worker on your site.
            </p>
            <form
              className="flex w-full max-w-sm flex-col gap-3 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <label htmlFor="hero-email" className="sr-only">
                Business email
              </label>
              <input
                id="hero-email"
                type="email"
                required
                placeholder="Business email"
                className="h-12 flex-1 rounded-lg border border-border bg-surface px-4 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-2 focus-visible:outline-ring"
              />
              <Button type="submit">Claim Early Access</Button>
            </form>
          </div>
          <div className="flex h-64 w-full max-w-xl items-center justify-center sm:h-96">
            <BuildingScene3D
              floorMaterials={floorMaterials}
              autoRotate={!reducedMotion}
              ariaLabel="Interactive 3D illustration of a building assembling from a blueprint into a completed structure — drag to orbit"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
