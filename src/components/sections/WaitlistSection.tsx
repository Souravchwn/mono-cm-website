"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWaitlistHandoff } from "@/lib/waitlist-handoff";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { BuildingScene3D, createBuildingMaterials } from "@/components/scenes/BuildingScene3D";
import { SkylineHorizonScene } from "@/components/scenes/SkylineHorizonScene";
import { Reveal } from "@/components/Reveal";
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

  // Was a 200vh scroll-pinned "reversal" of the Hero's build-up, scrubbed to
  // scroll position. Dropped per user report: the payoff (the 3D building
  // fading from solid to wireframe, at 30% opacity behind the form) reads as
  // near-invisible against the form itself, so the pin just felt like ~2
  // screens of scrolling that did nothing before the footer finally arrived.
  // The building now rests once in its resolved, fully-assembled state —
  // "the future of construction," built — matching this section's copy
  // better than a wireframe mid-transition would anyway. See design.md
  // → "Waitlist & Footer: dropped the pinned reversal, added parallax."
  useEffect(() => {
    floorMaterials.forEach((f, i) => {
      gsap.set(f.wire, { opacity: 0 });
      gsap.set(f.solid, {
        opacity: i === topFloor ? 0.85 : 0.55,
        emissiveIntensity: i === topFloor ? 0.55 : 0.18,
      });
    });
    gsap.set(floorMaterials[topFloor].glow, { intensity: 1.1 });
  }, [floorMaterials, topFloor]);

  return (
    <section
      id="09-waitlist"
      aria-label="Waitlist"
      className="relative overflow-hidden border-b border-border px-8 py-24 sm:px-16"
    >
      <SkylineHorizonScene />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30">
          <BuildingScene3D
            floorMaterials={floorMaterials}
            autoRotate={!reducedMotion}
            ariaLabel="Interactive 3D illustration of the completed building from the hero, fully assembled"
          />
        </div>

        <div className="flex w-full flex-col items-center gap-6 text-center">
          <Eyebrow>Waitlist</Eyebrow>
          <h2 className="text-h1 font-display font-semibold text-foreground">
            Build the{" "}
            <span className="bg-gradient-to-r from-accent-bright to-cyan bg-clip-text text-transparent">
              future of construction
            </span>{" "}
            with us.
          </h2>
        </div>

        <Reveal className="panel-floating relative w-full max-w-md rounded-2xl p-6">
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
        </Reveal>

        <Reveal delayMs={100} className="grid w-full max-w-2xl grid-cols-1 gap-4 text-left sm:grid-cols-2">
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
        </Reveal>
      </div>
    </section>
  );
}
