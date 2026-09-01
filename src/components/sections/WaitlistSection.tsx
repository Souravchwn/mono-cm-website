"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWaitlistHandoff } from "@/lib/waitlist-handoff";
import { gsap } from "@/lib/gsap";
import { useScrollScene } from "@/lib/use-scroll-scene";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { BuildingScene3D, createBuildingMaterials } from "@/components/scenes/BuildingScene3D";
import { GridGlow } from "@/components/GridGlow";
import { Button } from "@/components/ui/Button";
import { AnimatedSelect } from "@/components/ui/AnimatedSelect";
import { Eyebrow } from "@/components/ui/Eyebrow";

// Lifted out of the JSX now that the dropdowns are a controlled component rather
// than <option> children. Same values and order as the <select>s they replace.
const COMPANY_TYPES = ["General Contractor", "Subcontractor", "Developer", "Owner"] as const;
const PROJECT_VOLUMES = ["<$1M", "$1M–$5M", "$5M–$20M", "$20M+"] as const;

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
  // Receives the address typed into the Hero. Keyed on `handoffCount` rather than
  // the address itself, so arriving a second time with the same address still
  // re-applies, and so editing this field afterwards doesn't fight the prefill.
  const { email: handedOffEmail, handoffCount } = useWaitlistHandoff();
  const [email, setEmail] = useState("");
  const [companyType, setCompanyType] = useState<string>(COMPANY_TYPES[0]);
  const [projectVolume, setProjectVolume] = useState<string>(PROJECT_VOLUMES[0]);
  const [appliedHandoff, setAppliedHandoff] = useState(0);
  // Now the custom dropdown's trigger button rather than a native <select>.
  const companyTypeRef = useRef<HTMLButtonElement>(null);

  // Adjusting state during render (React's documented pattern for "derive from a
  // changed input") rather than syncing it in an effect, which would render once
  // with the stale value and then immediately again with the new one.
  if (handoffCount !== appliedHandoff) {
    setAppliedHandoff(handoffCount);
    setEmail(handedOffEmail);
  }

  useEffect(() => {
    if (handoffCount === 0) return;
    // Focus the first thing still *unanswered* rather than the field they just
    // filled in — the point of the handoff is to continue, not to re-type.
    // preventScroll: the scroll to this section is already in flight.
    companyTypeRef.current?.focus({ preventScroll: true });
  }, [handoffCount]);

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
        {/*
          Content here (heading 157 + form 472 + tiers 184 + gaps) came to 893px
          against 799px of usable height — a 94px overflow that `justify-center`
          splits evenly, pushing the heading up behind the fixed header and
          cutting the tier cards off the bottom. Same failure as Sections 03 and
          06; this one was missed at the time.

          Tightened py/gap to fit, and `justify-content: safe center` is the
          guard for viewports shorter than this one: `safe` falls back to
          flex-start when content would overflow, so it can spill *downward*
          into the section's own scroll room but never upward underneath the
          header, which is the part that reads as broken.
        */}
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col items-center gap-6 overflow-hidden border-b border-border px-8 py-8 [justify-content:safe_center] sm:px-16">
          <GridGlow />
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <BuildingScene3D
              floorMaterials={floorMaterials}
              autoRotate={!reducedMotion}
              ariaLabel="Interactive 3D illustration of the completed building from the hero, reversing back to a blueprint"
            />
          </div>

          <div className="relative flex w-full max-w-2xl flex-col items-center gap-6 text-center">
            <Eyebrow>Waitlist</Eyebrow>
            <h2 className="text-h1 font-display font-semibold text-foreground">
              Build the{" "}
              <span className="bg-gradient-to-r from-accent-bright to-cyan bg-clip-text text-transparent">
                future of construction
              </span>{" "}
              with us.
            </h2>
          </div>

          <div className="panel-floating relative w-full max-w-md rounded-2xl p-6">
            {submitted ? (
              // role="status" + aria-live: the form this replaces is unmounted,
              // so without an announced live region the submit is completely
              // silent for screen-reader users.
              <p
                role="status"
                aria-live="polite"
                className="panel-ring rounded-lg bg-accent/10 px-6 py-4 text-center text-foreground"
              >
                You&apos;re on the list — we&apos;ll be in touch.
              </p>
            ) : (
              <form
                className="flex w-full flex-col gap-4 text-left"
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
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="panel-ring h-12 rounded-lg bg-surface px-4 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label id="company-type-label" htmlFor="company-type" className="text-sm text-foreground-muted">
                    Company type
                  </label>
                  <AnimatedSelect
                    id="company-type"
                    name="company-type"
                    labelId="company-type-label"
                    triggerRef={companyTypeRef}
                    options={COMPANY_TYPES}
                    value={companyType}
                    onChange={setCompanyType}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label id="project-volume-label" htmlFor="project-volume" className="text-sm text-foreground-muted">
                    Annual project volume
                  </label>
                  <AnimatedSelect
                    id="project-volume"
                    name="project-volume"
                    labelId="project-volume-label"
                    options={PROJECT_VOLUMES}
                    value={projectVolume}
                    onChange={setProjectVolume}
                  />
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
                    inputMode="numeric"
                    className="panel-ring h-12 rounded-lg bg-surface px-4 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-br from-accent-bright to-accent"
                  style={{
                    boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 0 30px -4px rgba(16,185,129,0.55)",
                  }}
                >
                  Claim Early Access
                </Button>
              </form>
            )}
          </div>

          <div className="grid w-full max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
            {TIERS.map((tier) => (
              <div key={tier.name} className="panel-ring card-lift rounded-xl bg-surface p-4">
                <h3 className="font-display text-sm font-semibold text-foreground">{tier.name}</h3>
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
    </section>
  );
}
