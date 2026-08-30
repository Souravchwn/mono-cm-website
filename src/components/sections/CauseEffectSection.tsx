"use client";

import { useMemo } from "react";
import { useScrollScene } from "@/lib/use-scroll-scene";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { DiagramScene3D } from "@/components/scenes/DiagramScene3D";
import { CAUSE_EFFECT_NODES, createDiagramState } from "@/lib/scene-config";

export function CauseEffectSection() {
  const reducedMotion = useReducedMotion();
  const state = useMemo(() => {
    const s = createDiagramState(CAUSE_EFFECT_NODES);
    // The production event itself isn't a "consequence" — it's always visible,
    // only what it triggers reveals on scroll.
    s.nodes.production.value = 1;
    return s;
  }, []);

  const wrapperRef = useScrollScene(
    (tl) => {
      tl.to(
        [state.nodes.material, state.nodes.labor, state.nodes.equipment],
        { value: 1, stagger: 0.08, duration: 0.15, ease: "none" },
        0.1,
      )
        .to(
          [
            state.edges["production-material"],
            state.edges["production-labor"],
            state.edges["production-equipment"],
          ],
          { value: 1, stagger: 0.08, duration: 0.15, ease: "none" },
          0.1,
        )
        .to(
          [
            state.edges["material-schedule"],
            state.edges["labor-schedule"],
            state.edges["equipment-schedule"],
          ],
          { value: 1, stagger: 0.05, duration: 0.15, ease: "none" },
          0.4,
        )
        .to(state.nodes.schedule, { value: 1, duration: 0.1, ease: "none" }, 0.55)
        .to(state.edges["schedule-forecast"], { value: 1, duration: 0.15, ease: "none" }, 0.7)
        .to(state.nodes.forecast, { value: 1, duration: 0.15, ease: "none" }, 0.8);
    },
    () => {
      Object.values(state.nodes).forEach((o) => (o.value = 1));
      Object.values(state.edges).forEach((o) => (o.value = 1));
    },
  );

  return (
    <section id="03-cause-effect" aria-label="Cause and Effect / Data Flow">
      <div ref={wrapperRef} className="relative h-[200vh]">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-8 border-b border-border px-8 py-16 sm:px-16">
          <Eyebrow>03 — Cause &amp; Effect</Eyebrow>
          <p className="max-w-md text-center text-sm text-foreground-muted">
            One production event. Every downstream system updates from it.
          </p>
          <div className="relative aspect-[4/5] w-full max-w-sm sm:max-w-md">
            <DiagramScene3D
              nodes={CAUSE_EFFECT_NODES}
              state={state}
              animate={!reducedMotion}
              ariaLabel="3D diagram: a production event branching into material, labor, and equipment updates, converging through schedule into a cash-flow forecast"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
