"use client";

import { useRef } from "react";
import { MousePointerClick } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { OrbitalDiagram } from "@/components/scenes/OrbitalDiagram";
import { PRODUCTION_CHAIN } from "@/lib/production-chain";
import { useOrbitalScrollStep } from "@/lib/use-orbital-scroll-step";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export function CauseEffectSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { expandedId, setExpandedId } = useOrbitalScrollStep(wrapperRef, PRODUCTION_CHAIN, {
    start: "top top",
    end: "bottom bottom",
  });

  return (
    <section id="03-cause-effect" aria-label="Cause and Effect / Data Flow">
      <div ref={wrapperRef} className="relative h-[300vh]">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 border-b border-border px-8 py-16 sm:px-16">
          <div className="flex flex-col items-center gap-3">
            <Eyebrow>Cause &amp; Effect</Eyebrow>
            {/* This section had no heading element at all — its lead line is a
                <p>, so it was invisible in the document outline / heading
                navigation. Hidden visually to leave the existing design as-is. */}
            <h2 className="sr-only">One production event updates every downstream system</h2>
            <p className="max-w-md text-center text-sm text-foreground-muted">
              One production event. Every downstream system updates from it.
            </p>
            {/* The description explains the concept; this is a separate,
                visually distinct affordance telling the visitor the diagram
                below is actually interactive — a plain sentence blends into
                body copy and gets skimmed past. */}
            <span className="panel-ring inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-accent-bright">
              <MousePointerClick size={13} className={reducedMotion ? "" : "animate-pulse"} />
              Scroll to trace it, or click a node directly
            </span>
          </div>
          {/* Width caps at both 42rem (max-w-2xl, unchanged from before) and
              a viewport-height-derived limit — on a short window (~800px),
              the uncapped 672px-tall diagram plus the eyebrow/description/pill
              stack above it and this section's own py-16 could add up to more
              than the pinned `h-[calc(100vh-4rem)]` box, and centering
              (`justify-center`) an overflowing flex group pushes it out both
              top *and bottom* — the top spill lands behind the fixed header,
              reading as clipped/garbled text scrolling underneath it. */}
          <div className="relative aspect-square w-[min(100%,42rem,calc(100vh_-_24rem))]">
            <OrbitalDiagram
              nodes={PRODUCTION_CHAIN}
              expandedId={expandedId}
              onExpandedChange={setExpandedId}
              ariaLabel="Orbital diagram: a production event branching into material, labor, and equipment updates, converging through schedule into a cash-flow forecast — click a node for detail"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
