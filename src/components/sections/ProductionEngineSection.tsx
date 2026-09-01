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

// Small precise vertical stagger, no rotation — see design.md → "Premium
// material pass": rotated/wobbly tags read as sloppy, not premium. Applied
// via margin, not transform: the reveal animation below drives `transform`
// (translate-y-2 as the hidden state, GSAP tweening y to 0), so a permanent
// stagger needs a property GSAP never touches or the two would fight.
const CHIP_OFFSET = ["0px", "-5px", "3px"];

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
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] items-center border-b border-border px-8 sm:px-16">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-start gap-14 sm:grid-cols-[.95fr_1.05fr] sm:gap-10">
            {/* Left: room grid + production event */}
            <div>
              <Eyebrow>Production Engine</Eyebrow>
              <div className="relative mt-7 grid max-w-[280px] grid-cols-4 gap-2">
                {Array.from({ length: ROOMS }, (_, i) => (
                  <div
                    key={i}
                    data-selected={i === SELECTED_ROOM}
                    className="panel-ring aspect-square rounded-md bg-surface opacity-70 data-[selected=true]:bg-accent/[0.14] data-[selected=true]:opacity-100 data-[selected=true]:shadow-[0_0_30px_-4px_rgba(52,211,153,0.5)]"
                    style={i === SELECTED_ROOM ? { opacity: 0 } : undefined}
                  />
                ))}
              </div>
              <p
                data-event-label
                className="panel-ring mt-4 inline-block translate-y-2 rounded-full bg-surface px-3.5 py-1.5 text-sm whitespace-nowrap text-accent-bright opacity-0"
              >
                Concrete poured — 25 m³
              </p>
            </div>

            {/* Right: cascading update chips + pull-quote */}
            <div className="pt-1">
              <div className="flex flex-wrap gap-2.5">
                {CHIPS_GROUP_1.map((chip, i) => (
                  <div
                    key={chip.label}
                    data-chip-group="1"
                    className="panel-ring translate-y-2 rounded-[10px] bg-surface-2 px-3.5 py-2.5 text-[13px] opacity-0 shadow-[0_16px_30px_-16px_rgba(0,0,0,0.6)]"
                    style={{ marginTop: CHIP_OFFSET[i] }}
                  >
                    <span className="text-foreground-muted">{chip.label}</span>{" "}
                    <span className="font-semibold text-foreground tabular-nums">{chip.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3.5 ml-7 flex flex-wrap gap-2.5">
                {CHIPS_GROUP_2.map((chip, i) => (
                  <div
                    key={chip.label}
                    data-chip-group="2"
                    className="panel-ring translate-y-2 rounded-[10px] bg-surface-2 px-3.5 py-2.5 text-[13px] opacity-0 shadow-[0_16px_30px_-16px_rgba(0,0,0,0.6)]"
                    style={{ marginTop: CHIP_OFFSET[i] }}
                  >
                    <span className="text-foreground-muted">{chip.label}</span>{" "}
                    <span className="font-semibold text-foreground tabular-nums">{chip.value}</span>
                  </div>
                ))}
              </div>

              <p
                data-key-message
                className="mt-6 translate-y-2 bg-gradient-to-b from-foreground to-foreground-muted bg-clip-text text-[clamp(1.5rem,1.15rem+1.6vw,2.5rem)] leading-[1.18] font-semibold tracking-tight text-balance text-transparent opacity-0"
              >
                When production moves on the drawing, everything else moves automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
