import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { ParallaxLayer } from "@/components/ParallaxLayer";
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

function BrowserChrome({
  title,
  children,
  className = "",
  style,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`panel-ring absolute w-full max-w-[420px] overflow-hidden rounded-xl bg-surface shadow-[0_60px_100px_-30px_rgba(0,0,0,0.8)] ${className}`}
      style={style}
    >
      <div
        className="flex items-center gap-1.5 px-3.5 py-2.5 shadow-[0_1px_0_var(--color-border)]"
        style={{ background: "linear-gradient(180deg, var(--color-surface-2), var(--color-surface))" }}
      >
        <span className="h-2 w-2 rounded-full bg-[#e05a4e]" />
        <span className="h-2 w-2 rounded-full bg-[#e0a83f]" />
        <span className="h-2 w-2 rounded-full bg-[#3fa860]" />
        <span className="ml-2 text-xs text-foreground-muted">{title}</span>
      </div>
      <div className="p-4.5">{children}</div>
    </div>
  );
}

export function RealProductUISection() {
  return (
    <section
      id="05-real-product-ui"
      aria-label="Real Product UI"
      className="relative overflow-hidden border-b border-border bg-surface/40 px-8 py-24 sm:px-16"
    >
      <ParallaxLayer
        speed={0.28}
        className="pointer-events-none absolute top-5 right-[-6rem] h-[31rem] w-[31rem] rounded-full blur-[80px]"
        style={{ background: "var(--glow-cyan)" }}
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 lg:grid-cols-[.85fr_1.15fr]">
        <div className="flex flex-col gap-3">
          <Eyebrow>Real Product</Eyebrow>
          <h2 className="text-h1 font-display font-semibold text-foreground">
            This is the actual platform.
          </h2>
          <p className="max-w-sm text-foreground-muted">
            Not a marketing recreation — the same dashboard your team would open Monday morning.
          </p>
          <DemoDataBadge />
        </div>

        <Reveal>
          <div className="relative h-[26rem] sm:h-[24rem]">
            <BrowserChrome
              title="Production Dashboard"
              className="top-11 left-8 z-[1] opacity-80 sm:left-16"
              style={{ transform: "perspective(1400px) rotateY(8deg) rotateX(2deg) scale(0.92)" }}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Production Dashboard</span>
                <DemoDataBadge />
              </div>
              <div className="flex flex-col gap-3">
                {PRODUCTION_STATS.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs text-foreground-muted">
                      <span>{stat.label}</span>
                      <span className="tabular-nums">{stat.value}%</span>
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
              <div className="mt-3 flex justify-between text-xs text-foreground-muted shadow-[0_-1px_0_var(--color-border)] pt-3">
                <span>Productivity</span>
                <span className="text-foreground tabular-nums">58.3 m² / man-day</span>
              </div>
            </BrowserChrome>

            <BrowserChrome
              title="Project Dashboard"
              className="top-0 left-0 z-[2]"
              style={{ transform: "perspective(1400px) rotateY(-6deg) rotateX(2deg)" }}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs text-foreground-muted">Project Dashboard</span>
                <DemoDataBadge />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {PROJECT_STATS.map((stat) => (
                  <div key={stat.label} className="flex flex-col gap-1">
                    <span className="text-xs text-foreground-muted">{stat.label}</span>
                    <span className="font-display text-xl font-semibold text-foreground tabular-nums">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-1.5 shadow-[0_-1px_0_var(--color-border)] pt-3">
                <div className="flex justify-between text-xs text-foreground-muted">
                  <span>Progress</span>
                  <span className="tabular-nums">67%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div className="h-full w-[67%] rounded-full bg-accent" />
                </div>
              </div>
            </BrowserChrome>
          </div>
        </Reveal>
      </div>

      <Reveal delayMs={150}>
        <div className="panel-raised relative z-[1] mx-auto mt-14 max-w-6xl rounded-xl p-6">
          <h3 className="font-display text-sm font-medium text-foreground-muted">
            Cash Flow Forecast
          </h3>
          <div className="mt-3">
            <AnimatedForecastChart />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
