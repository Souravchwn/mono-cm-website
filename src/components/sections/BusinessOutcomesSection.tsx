"use client";

import { useMemo } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { DiagramScene3D } from "@/components/scenes/DiagramScene3D";
import { BUSINESS_OUTCOME_NODES, createDiagramState, resolveDiagramState } from "@/lib/scene-config";

export function BusinessOutcomesSection() {
  const reducedMotion = useReducedMotion();
  const state = useMemo(() => {
    const s = createDiagramState(BUSINESS_OUTCOME_NODES);
    // Not scroll-scrubbed — this section reuses the Section 03 diagram already
    // resolved, framed as the business-impact payoff (context/sections/
    // 06-business-outcomes.md). Same node positions/component as 03, per the
    // "same visual object recurring" requirement.
    resolveDiagramState(s);
    return s;
  }, []);

  return (
    <section
      id="06-business-outcomes"
      aria-label="Business Outcomes"
      className="border-b border-border px-8 py-24 sm:px-16"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 text-center">
        <div className="flex flex-col gap-3">
          <Eyebrow>06 — Business Outcomes</Eyebrow>
          <h2 className="text-h1 font-display font-semibold text-foreground">
            One production event. Six business consequences.
          </h2>
        </div>

        <Reveal className="relative aspect-[4/5] w-full max-w-md">
          <DiagramScene3D
            nodes={BUSINESS_OUTCOME_NODES}
            state={state}
            animate={!reducedMotion}
            ariaLabel="3D diagram: production resolving through material consumption, labor cost, and equipment utilization into a cash-flow forecast"
          />
        </Reveal>

        <Reveal delayMs={120}>
          <p className="text-h2 max-w-lg font-display font-medium text-foreground">
            Mono CM doesn&apos;t just record what happened on your project. It understands what
            that event means for everything else.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
