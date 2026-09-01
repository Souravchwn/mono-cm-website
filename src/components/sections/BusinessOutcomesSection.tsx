"use client";

import { useRef } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { OrbitalDiagram } from "@/components/scenes/OrbitalDiagram";
import { PRODUCTION_CHAIN } from "@/lib/production-chain";
import { useOrbitalScrollStep } from "@/lib/use-orbital-scroll-step";

export function BusinessOutcomesSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Pinned like Section 03 now — start/end against the wrapper itself
  // ("top top"/"bottom bottom"), not the default 06/07 non-pinned range.
  const { expandedId, setExpandedId } = useOrbitalScrollStep(wrapperRef, PRODUCTION_CHAIN, {
    start: "top top",
    end: "bottom bottom",
  });

  return (
    <section id="06-business-outcomes" aria-label="Business Outcomes">
      <div ref={wrapperRef} className="relative h-[300vh]">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 border-b border-border px-8 py-16 text-center sm:px-16">
          <div className="flex flex-col items-center gap-3">
            <Eyebrow>Business Outcomes</Eyebrow>
            <h2 className="text-h1 font-display font-semibold text-foreground">
              One production event. Six business consequences.
            </h2>
          </div>

          {/* Capped by viewport height too, not just width — see the same
              fix/rationale in CauseEffectSection. This section's heading and
              closing paragraph are both up to two lines of large display
              type, so it reserves more height than Section 03's. */}
          <div className="relative aspect-square w-[min(100%,42rem,calc(100vh_-_30rem))]">
            <OrbitalDiagram
              nodes={PRODUCTION_CHAIN}
              expandedId={expandedId}
              onExpandedChange={setExpandedId}
              ariaLabel="Orbital diagram: production resolving through material, labor, and equipment updates into a cash-flow forecast — the same diagram shown earlier"
            />
          </div>

          <p className="text-h2 max-w-lg font-display font-medium text-foreground">
            Mono CM doesn&apos;t just record what happened on your project. It understands what
            that event means for everything else.
          </p>
        </div>
      </div>
    </section>
  );
}
