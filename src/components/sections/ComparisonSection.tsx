"use client";

import { useRef, type CSSProperties } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { OrbitalDiagram } from "@/components/scenes/OrbitalDiagram";
import { PRODUCTION_CHAIN } from "@/lib/production-chain";
import { useOrbitalScrollStep } from "@/lib/use-orbital-scroll-step";
import { useReducedMotion } from "@/lib/use-reduced-motion";

const LEGACY_SYSTEMS = [
  { label: "Drawing", ml: "ml-0", rotate: -1 },
  { label: "Inventory", ml: "ml-6", rotate: 1 },
  { label: "Timesheet", ml: "ml-2", rotate: -2 },
  { label: "Equipment", ml: "ml-10", rotate: 1.5 },
  { label: "Finance", ml: "ml-4", rotate: -1 },
];

export function ComparisonSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  // Pinned like Sections 03/06 now.
  const { expandedId, setExpandedId } = useOrbitalScrollStep(wrapperRef, PRODUCTION_CHAIN, {
    start: "top top",
    end: "bottom bottom",
  });

  return (
    <section id="07-comparison" aria-label="Competitive Comparison">
      <div ref={wrapperRef} className="relative h-[300vh]">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col justify-center gap-10 border-b border-border px-8 py-16 sm:px-16">
          <Eyebrow>Comparison</Eyebrow>
          {/* The visible headings in this section are the two column labels
              ("LEGACY MODEL" / "MONO CM"), which are h3s — without this the
              document outline skips h1 → h3. Visually hidden rather than
              shown, because the Eyebrow already communicates this to sighted
              visitors and adding a second visible title would be redundant. */}
          <h2 className="sr-only">Legacy model versus Mono CM</h2>

          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-12 md:grid-cols-2 md:divide-x md:divide-border">
            <div className="flex flex-col gap-6">
              <h3 className="font-display text-sm font-medium tracking-wide text-foreground-muted">
                LEGACY MODEL
              </h3>
              {/* `flex-1 justify-center` here (and on MONO CM's body below) is
                  the fix for a reported column-alignment complaint: both
                  headings already start at the same y (grid gives the two
                  columns equal height), but the orbital diagram's own visual
                  weight sits at its *box's* vertical center, not its top —
                  same top edge, different center of mass. Centering this
                  column's body within the same remaining row height the
                  diagram gets, instead of leaving it top-aligned right under
                  the heading, lines the two up without touching the shared
                  `OrbitalDiagram` component's internal anchor. */}
              <div className="flex flex-1 flex-col justify-center gap-6">
                <div className="flex flex-col gap-3">
                  {LEGACY_SYSTEMS.map((system, i) => (
                    <div
                      key={system.label}
                      className={`w-fit rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground-muted ${system.ml} ${
                        reducedMotion ? "" : "animate-legacy-scatter-in"
                      }`}
                      style={
                        {
                          "--legacy-rotate": `${system.rotate}deg`,
                          animationDelay: reducedMotion ? undefined : `${i * 90}ms`,
                        } as CSSProperties
                      }
                    >
                      {system.label}
                    </div>
                  ))}
                </div>
                {/* Bolded/emphasized deliberately — this is the section's thesis
                    statement, not another supporting line, and it lands after
                    every scattered card has settled. */}
                <p
                  className={`text-base font-semibold text-foreground ${reducedMotion ? "" : "animate-legacy-scatter-in"}`}
                  style={
                    {
                      "--legacy-rotate": "0deg",
                      animationDelay: reducedMotion ? undefined : `${LEGACY_SYSTEMS.length * 90}ms`,
                    } as CSSProperties
                  }
                >
                  Separate systems, no shared source of truth.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6 md:pl-12">
              <h3 className="font-display text-sm font-medium tracking-wide text-accent-bright">
                MONO CM
              </h3>
              <div className="flex flex-1 flex-col justify-center gap-6">
                <div className="relative aspect-square w-full max-w-lg">
                  <OrbitalDiagram
                    nodes={PRODUCTION_CHAIN}
                    expandedId={expandedId}
                    onExpandedChange={setExpandedId}
                    ariaLabel="Orbital diagram of Mono CM's unified production chain — the same diagram shown earlier, resolving one production event into a forecast"
                  />
                </div>
                <p className="text-sm text-foreground-muted">
                  One production event, one connected system, one forecast.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
