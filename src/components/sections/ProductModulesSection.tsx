import { Eyebrow } from "@/components/ui/Eyebrow";
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
          <Eyebrow>04 — Product Modules</Eyebrow>
          <h2 className="text-h1 font-display font-semibold text-foreground">
            One platform, every system on your site.
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((module, i) => (
            <Reveal key={module.title} delayMs={i * 60}>
              <BentoCard title={module.title} tracks={module.tracks} icon={module.icon} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
