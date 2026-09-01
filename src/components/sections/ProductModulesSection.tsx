import { Eyebrow } from "@/components/ui/Eyebrow";
import { MorphingText } from "@/components/ui/liquid-text";
import { Reveal } from "@/components/Reveal";
import { BentoCard } from "@/components/BentoCard";
import {
  CashFlowIcon,
  MaterialIcon,
  EquipmentIcon,
  TimesheetsIcon,
  DrawingsIcon,
  ProductionIcon,
} from "@/components/icons";

const MODULES = [
  {
    title: "Cash Flow Engine",
    tracks: "Project cost, forecast, burn, commitments, cash position",
    icon: <CashFlowIcon />,
  },
  {
    title: "Material Lifecycle",
    tracks: "Estimate → Purchase → Delivery → Inventory → Consumption → Production",
    icon: <MaterialIcon />,
  },
  {
    title: "Equipment Yard",
    tracks: "Equipment, utilization, location, idle time, maintenance",
    icon: <EquipmentIcon />,
  },
  {
    title: "Timesheets",
    tracks: "Workers, hours, productivity, cost",
    icon: <TimesheetsIcon />,
  },
  {
    title: "Drawings",
    tracks: "Versions, locations, production, changes",
    icon: <DrawingsIcon />,
  },
  {
    title: "Production",
    tracks: "Quantity, progress, productivity, forecast",
    icon: <ProductionIcon />,
  },
];

export function ProductModulesSection() {
  return (
    <section
      id="04-product-modules"
      aria-label="Product Modules"
      className="border-b border-border px-8 py-24 sm:px-16"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Eyebrow>Product Modules</Eyebrow>
          <h2 className="text-h1 font-display font-semibold text-foreground">
            One platform, every system on your site.
          </h2>
          {/* Cycles through the six real module titles below — the motion
              itself is the "one engine, many systems" claim, not decoration
              bolted onto the line (design.md's governing animation rule). */}
          <div className="flex items-baseline gap-2.5 text-lg text-foreground-muted sm:text-xl">
            <span>Tracking</span>
            <MorphingText
              texts={MODULES.map((m) => m.title)}
              className="max-w-[16rem] text-lg text-accent-bright sm:text-xl"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:[grid-auto-rows:1fr] lg:grid-cols-4">
          {MODULES.map((module, i) => (
            <Reveal key={module.title} delayMs={i * 60} className={i === 0 ? "sm:col-span-2 lg:col-span-2" : ""}>
              <BentoCard
                title={module.title}
                tracks={module.tracks}
                icon={module.icon}
                featured={i === 0}
                // Only the wide card gets one — it's the only card with spare
                // height. "One record" is this page's own thesis restated, not
                // a new claim (see the section heading above it).
                footer={i === 0 ? { value: "1", label: "record behind every cost line" } : undefined}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
