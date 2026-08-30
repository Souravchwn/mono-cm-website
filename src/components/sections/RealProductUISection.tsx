import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { DemoDataBadge } from "@/components/DemoDataBadge";
import { AnimatedForecastChart } from "@/components/AnimatedForecastChart";

const PROJECT_STATS = [
  { label: "Project Value", value: "$12.8M" },
  { label: "Cost", value: "$8.4M" },
  { label: "Committed", value: "$7.9M" },
  { label: "Forecast", value: "$9.1M" },
];

const PRODUCTION_STATS = [
  { label: "Concrete", value: 84 },
  { label: "Steel", value: 92 },
  { label: "Electrical", value: 31 },
];

export function RealProductUISection() {
  return (
    <section
      id="05-real-product-ui"
      aria-label="Real Product UI"
      className="border-b border-border bg-surface/40 px-8 py-24 sm:px-16"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Eyebrow>05 — Real Product UI</Eyebrow>
          <h2 className="text-h1 font-display font-semibold text-foreground">
            This is the actual platform.
          </h2>
          <DemoDataBadge />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6">
              <h3 className="font-display text-sm font-medium text-foreground-muted">
                Project Dashboard
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {PROJECT_STATS.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <span className="text-xs text-foreground-muted">{stat.label}</span>
                    <span className="font-display text-xl font-semibold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-foreground-muted">
                  <span>Progress</span>
                  <span>67%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div className="h-full w-[67%] rounded-full bg-accent" />
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={100}>
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6">
              <h3 className="font-display text-sm font-medium text-foreground-muted">
                Production Dashboard
              </h3>
              <div className="flex flex-col gap-3">
                {PRODUCTION_STATS.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs text-foreground-muted">
                      <span>{stat.label}</span>
                      <span>{stat.value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-accent-bright"
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-foreground-muted">
                <span>Productivity</span>
                <span className="text-foreground">58.3 m² / man-day</span>
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={200} className="lg:col-span-2">
            <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-6">
              <h3 className="font-display text-sm font-medium text-foreground-muted">
                Cash Flow Forecast
              </h3>
              <AnimatedForecastChart />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
