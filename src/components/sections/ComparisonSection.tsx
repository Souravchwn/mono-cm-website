"use client";

import { useMemo } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { DiagramScene3D } from "@/components/scenes/DiagramScene3D";
import { CAUSE_EFFECT_NODES, createDiagramState, resolveDiagramState } from "@/lib/scene-config";

const LEGACY_SYSTEMS = [
  { label: "Drawing", offset: "ml-0 rotate-[-1deg]" },
  { label: "Inventory", offset: "ml-6 rotate-[1deg]" },
  { label: "Timesheet", offset: "ml-2 rotate-[-2deg]" },
  { label: "Equipment", offset: "ml-10 rotate-[1.5deg]" },
  { label: "Finance", offset: "ml-4 rotate-[-1deg]" },
];

export function ComparisonSection() {
  const reducedMotion = useReducedMotion();
  const state = useMemo(() => {
    const s = createDiagramState(CAUSE_EFFECT_NODES);
    // Reuses the Section 03/06 production-chain visual, already resolved — the
    // right-hand side of the fragmentation-vs-unification contrast (context/
    // sections/07-comparison.md).
    resolveDiagramState(s);
    return s;
  }, []);

  return (
    <section
      id="07-comparison"
      aria-label="Competitive Comparison"
      className="border-b border-border px-8 py-24 sm:px-16"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <Eyebrow>07 — Comparison</Eyebrow>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:divide-x md:divide-border">
          <div className="flex flex-col gap-6">
            <h3 className="font-display text-sm font-medium tracking-wide text-foreground-muted">
              LEGACY MODEL
            </h3>
            <div className="flex flex-col gap-3">
              {LEGACY_SYSTEMS.map((system) => (
                <div
                  key={system.label}
                  className={`w-fit rounded-lg border border-border bg-surface px-4 py-2 text-sm text-foreground-muted ${system.offset}`}
                >
                  {system.label}
                </div>
              ))}
            </div>
            <p className="text-sm text-foreground-muted">Separate systems, no shared source of truth.</p>
          </div>

          <div className="flex flex-col gap-6 md:pl-12">
            <h3 className="font-display text-sm font-medium tracking-wide text-accent-bright">
              MONO CM
            </h3>
            <Reveal>
              <div className="relative aspect-[4/5] w-full max-w-sm">
                <DiagramScene3D
                  nodes={CAUSE_EFFECT_NODES}
                  state={state}
                  animate={!reducedMotion}
                  ariaLabel="3D diagram of Mono CM's unified production chain — the same diagram shown earlier, resolving one production event into a forecast"
                />
              </div>
            </Reveal>
            <p className="text-sm text-foreground-muted">
              One production event, one connected system, one forecast.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
