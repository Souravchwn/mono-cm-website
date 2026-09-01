import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/Reveal";
import { ParallaxLayer } from "@/components/ParallaxLayer";

/**
 * context/sections/08-trust-proof.md: every claim here must connect to a real
 * artifact. Founder/Team and Customer Evidence have no real content yet (see
 * context/data-integrity.md), so they're marked "coming soon" rather than filled
 * with placeholder content that looks real.
 */
const SIDE_CARDS = [
  {
    title: "Engineering",
    body: "One relational data model connects production, cost, materials, labor, and equipment — so an update in one place propagates everywhere else.",
    pending: false,
  },
  {
    title: "Real Product",
    body: "Actual product dashboards — see Section 05 above.",
    href: "#05-real-product-ui",
    pending: false,
  },
  {
    title: "Security",
    body: null,
    list: ["Role-based access control", "Encrypted in transit and at rest", "Regular backups"],
    pending: false,
  },
  {
    title: "Customer Evidence",
    body: "Pilot case studies and customer metrics will appear here once the first cohort completes onboarding.",
    pending: true,
  },
];

/**
 * Facts for the founder card's lower half. Each one restates something this
 * site already says elsewhere — nothing here is a new claim, and deliberately
 * none of it is a metric (no customer counts, no savings figures), which is
 * exactly what context/data-integrity.md blocks until independently verified:
 *  - "One relational model"  → the Engineering card's copy, above.
 *  - "Encrypted at rest"     → the Security card's list, above.
 *  - "Early design partners" → Section 09's "VIP Contractor — Early Design Partner" tier.
 *  - "Pre-launch beta"       → the site's own "Beta access" / "Claim Early Access" CTAs.
 */
const FOUNDER_FACTS = [
  { label: "Built on", value: "One relational model" },
  { label: "Stage", value: "Pre-launch beta" },
  { label: "Access", value: "Early design partners" },
  { label: "Data", value: "Encrypted at rest" },
];

export function TrustSection() {
  return (
    <section
      id="08-trust-proof"
      aria-label="Trust and Proof"
      className="relative overflow-hidden border-b border-border px-8 py-24 sm:px-16"
    >
      <ParallaxLayer
        speed={0.25}
        className="pointer-events-none absolute top-10 left-[-8rem] h-[26rem] w-[26rem] rounded-full blur-[80px]"
        style={{ background: "var(--glow-emerald)" }}
      />
      <div className="relative mx-auto flex max-w-5xl flex-col gap-10">
        <Eyebrow>Trust</Eyebrow>
        {/* Same h1 → h3 outline skip as Section 07 — the visible headings here
            ("Founder & Team" and the proof-card titles) are all h3s. */}
        <h2 className="sr-only">Why you can trust Mono CM</h2>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <Reveal>
            {/* Deliberately not a quote/cite — a "coming soon" card dressed up as
                testimonial-style typography would misrepresent it as a real
                founder quote, which context/data-integrity.md explicitly forbids. */}
            <div className="panel-raised flex h-full min-h-[21rem] flex-col gap-4 rounded-2xl p-9">
              <span
                className="h-13 w-13 rounded-full"
                aria-hidden="true"
                style={{
                  background: "linear-gradient(150deg, var(--color-accent-bright), var(--color-cyan))",
                  boxShadow: "0 0 30px -4px rgba(52,211,153,0.5), inset 0 1px 2px rgba(255,255,255,0.5)",
                }}
              />
              <h3 className="font-display text-2xl leading-[1.2] font-medium tracking-tight text-foreground">
                Founder &amp; Team
              </h3>
              <p className="text-sm text-foreground-muted italic">
                Team profiles are coming soon — we&apos;d rather ship the product first and let the
                people behind it introduce themselves once there&apos;s a real team page to point to.
              </p>
              {/* This card used to be `justify-end` on a 21rem minimum, leaving
                  roughly four-fifths of it empty while the column beside it ran
                  past its bottom edge. Every fact below is one this site already
                  states elsewhere — the relational-model claim from the
                  Engineering card, the encryption line from Security, and the
                  early-design-partner tier from Section 09 — so nothing new is
                  being asserted here. See context/data-integrity.md. */}
              <dl className="mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
                {FOUNDER_FACTS.map((fact) => (
                  <div key={fact.label} className="bg-surface px-3.5 py-3">
                    <dt className="text-[10.5px] font-medium tracking-wide text-foreground-muted uppercase">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 font-display text-[13px] font-semibold text-foreground">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <div className="flex flex-col gap-4">
            {SIDE_CARDS.map((card, i) => (
              <Reveal key={card.title} delayMs={i * 60}>
                <div className="panel-ring card-lift flex h-full flex-col gap-2 rounded-xl bg-surface p-5">
                  <h3 className="font-display text-sm font-semibold text-foreground">{card.title}</h3>
                  {card.body && (
                    <p
                      className={`text-sm ${card.pending ? "text-foreground-muted italic" : "text-foreground-muted"}`}
                    >
                      {card.body}
                    </p>
                  )}
                  {card.list && (
                    <ul className="flex flex-col gap-1 text-sm text-foreground-muted">
                      {card.list.map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-accent-bright" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {card.href && (
                    <a href={card.href} className="mt-auto text-sm font-medium text-accent-bright">
                      View dashboards →
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
