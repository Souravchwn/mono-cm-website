"use client";

import { useMemo, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useScrollScene } from "@/lib/use-scroll-scene";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { BuildingScene3D, createBuildingMaterials } from "@/components/scenes/BuildingScene3D";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

const TIERS = [
  {
    name: "Standard — Early Access",
    perks: ["Beta access", "Product updates", "Launch notifications"],
  },
  {
    name: "VIP Contractor — Early Design Partner",
    perks: [
      "Priority onboarding",
      "Direct product feedback",
      "Technical onboarding",
      "Feature-request channel",
      "Early access to selected modules",
    ],
  },
];

export function WaitlistSection() {
  const [submitted, setSubmitted] = useState(false);
  const floorMaterials = useMemo(() => createBuildingMaterials(), []);
  const topFloor = floorMaterials.length - 1;
  const reducedMotion = useReducedMotion();

  const wrapperRef = useScrollScene(
    (tl) => {
      // Start solid (reverse of Hero's end state), then undo each stage in the
      // opposite order Hero built it in — same reverse-of-Hero pattern as the
      // old SVG version, just targeting Three.js materials instead of DOM opacity.
      floorMaterials.forEach((f, i) => {
        gsap.set(f.wire, { opacity: 1 });
        gsap.set(f.solid, {
          opacity: i === topFloor ? 0.85 : 0.1,
          emissiveIntensity: i === topFloor ? 0.55 : 0.18,
        });
      });
      gsap.set(floorMaterials[topFloor].glow, { intensity: 1.1 });

      const wires = floorMaterials.map((f) => f.wire);
      const solids = floorMaterials.map((f) => f.solid);

      tl.to(floorMaterials[topFloor].glow, { intensity: 0, duration: 0.15, ease: "none" }, 0)
        .to(
          solids,
          { opacity: 0, emissiveIntensity: 0, stagger: { each: 0.12, from: "end" }, duration: 0.3, ease: "none" },
          0.05,
        )
        .to(wires, { opacity: 0, stagger: { each: 0.12, from: "end" }, duration: 0.3, ease: "none" }, 0.5);
    },
    () => {
      floorMaterials.forEach((f) => {
        gsap.set(f.wire, { opacity: 0 });
        gsap.set(f.solid, { opacity: 0, emissiveIntensity: 0 });
      });
      gsap.set(floorMaterials[topFloor].glow, { intensity: 0 });
    },
  );

  return (
    <section id="09-waitlist" aria-label="Waitlist">
      <div ref={wrapperRef} className="relative h-[200vh]">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-10 overflow-hidden border-b border-border px-8 py-16 sm:px-16">
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <BuildingScene3D
              floorMaterials={floorMaterials}
              autoRotate={!reducedMotion}
              ariaLabel="Interactive 3D illustration of the completed building from the hero, reversing back to a blueprint"
            />
          </div>

          <div className="relative flex w-full max-w-3xl flex-col items-center gap-8 text-center">
            <Eyebrow>09 — Waitlist</Eyebrow>
            <h2 className="text-h1 font-display font-semibold text-foreground">
              Build the future of construction with us.
            </h2>

            {submitted ? (
              <p className="rounded-lg border border-accent-bright/40 bg-accent/10 px-6 py-4 text-foreground">
                You&apos;re on the list — we&apos;ll be in touch.
              </p>
            ) : (
              <form
                className="flex w-full max-w-md flex-col gap-4 text-left"
                onSubmit={(event) => {
                  event.preventDefault();
                  // No backend exists yet — see context/tech-notes.md open questions.
                  setSubmitted(true);
                }}
              >
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="waitlist-email" className="text-sm text-foreground-muted">
                    Business email
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    required
                    className="h-12 rounded-lg border border-border bg-surface px-4 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="company-type" className="text-sm text-foreground-muted">
                    Company type
                  </label>
                  <select
                    id="company-type"
                    className="h-12 rounded-lg border border-border bg-surface px-4 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <option>General Contractor</option>
                    <option>Subcontractor</option>
                    <option>Developer</option>
                    <option>Owner</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="project-volume" className="text-sm text-foreground-muted">
                    Annual project volume
                  </label>
                  <select
                    id="project-volume"
                    className="h-12 rounded-lg border border-border bg-surface px-4 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <option>&lt;$1M</option>
                    <option>$1M–$5M</option>
                    <option>$5M–$20M</option>
                    <option>$20M+</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="active-projects" className="text-sm text-foreground-muted">
                    Active projects you currently manage{" "}
                    <span className="text-foreground-muted/70">(optional)</span>
                  </label>
                  <input
                    id="active-projects"
                    type="number"
                    min={0}
                    className="h-12 rounded-lg border border-border bg-surface px-4 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Claim Early Access
                </Button>
              </form>
            )}

            <div className="grid w-full grid-cols-1 gap-4 pt-4 text-left sm:grid-cols-2">
              {TIERS.map((tier) => (
                <div key={tier.name} className="rounded-xl border border-border bg-surface p-5">
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    {tier.name}
                  </h3>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-foreground-muted">
                    {tier.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
