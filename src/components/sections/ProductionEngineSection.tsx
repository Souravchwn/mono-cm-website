"use client";

import { gsap } from "@/lib/gsap";
import { useScrollScene } from "@/lib/use-scroll-scene";
import { Eyebrow } from "@/components/ui/Eyebrow";

const ROOMS = 12;
const SELECTED_ROOM = 5;

const CHIPS_GROUP_1 = [
  { label: "Material", value: "−25 m³" },
  { label: "Labor", value: "+Production Hours" },
  { label: "Equipment", value: "+Pump Usage" },
];
const CHIPS_GROUP_2 = [
  { label: "Schedule", value: "+Progress" },
  { label: "Cash Flow", value: "+Cost" },
  { label: "Forecast", value: "+Updated Projection" },
];

export function ProductionEngineSection() {
  const wrapperRef = useScrollScene(
    (tl) => {
      tl.to('[data-selected="true"]', { opacity: 1, duration: 0.15, ease: "none" }, 0.15)
        .to('[data-event-label]', { opacity: 1, y: 0, duration: 0.15, ease: "none" }, 0.32)
        .to('[data-chip-group="1"]', { opacity: 1, y: 0, stagger: 0.06, duration: 0.15, ease: "none" }, 0.55)
        .to('[data-chip-group="2"]', { opacity: 1, y: 0, stagger: 0.06, duration: 0.15, ease: "none" }, 0.75)
        .to('[data-key-message]', { opacity: 1, y: 0, duration: 0.15, ease: "none" }, 0.92);
    },
    () => {
      gsap.set('[data-selected="true"]', { opacity: 1 });
      gsap.set(['[data-event-label]', '[data-chip-group]', '[data-key-message]'], {
        opacity: 1,
        y: 0,
      });
    },
  );

  return (
    <section id="02-production-engine" aria-label="Production Engine">
      <div ref={wrapperRef} className="relative h-[200vh]">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center gap-10 border-b border-border px-8 sm:px-16">
          <Eyebrow>02 — Production Engine</Eyebrow>

          <div className="relative">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: ROOMS }, (_, i) => (
                <div
                  key={i}
                  data-selected={i === SELECTED_ROOM}
                  className="h-14 w-14 rounded-md border border-border bg-surface data-[selected=true]:border-accent-bright data-[selected=true]:opacity-100 data-[selected=true]:shadow-[0_0_24px_rgba(52,211,153,0.35)] opacity-70 sm:h-16 sm:w-16"
                  style={i === SELECTED_ROOM ? { opacity: 0 } : undefined}
                />
              ))}
            </div>
            <p
              data-event-label
              className="absolute top-full left-1/2 mt-3 -translate-x-1/2 translate-y-2 rounded-full border border-accent-bright/40 bg-surface px-4 py-1.5 text-sm whitespace-nowrap text-accent-bright opacity-0"
            >
              Concrete poured — 25 m³
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {[...CHIPS_GROUP_1.map((c) => ({ ...c, group: 1 })), ...CHIPS_GROUP_2.map((c) => ({ ...c, group: 2 }))].map(
              (chip) => (
                <div
                  key={chip.label}
                  data-chip-group={chip.group}
                  className="translate-y-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm opacity-0"
                >
                  <span className="text-foreground-muted">{chip.label}</span>{" "}
                  <span className="font-medium text-foreground">{chip.value}</span>
                </div>
              ),
            )}
          </div>

          <p
            data-key-message
            className="text-h2 max-w-xl translate-y-2 text-center font-display font-medium text-foreground opacity-0"
          >
            When production moves on the drawing, everything else moves automatically.
          </p>
        </div>
      </div>
    </section>
  );
}
