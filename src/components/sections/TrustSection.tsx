import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/Reveal";

/**
 * context/sections/08-trust-proof.md: every claim here must connect to a real
 * artifact. Founder/Team and Customer Evidence have no real content yet (see
 * context/data-integrity.md), so they're marked "coming soon" rather than filled
 * with placeholder content that looks real.
 */
const CARDS = [
  {
    title: "Founder / Team",
    body: "Team profiles are coming soon.",
    pending: true,
  },
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
    title: "Customer Evidence",
    body: "Pilot case studies and customer metrics will appear here once the first cohort completes onboarding.",
    pending: true,
  },
  {
    title: "Security",
    body: null,
    list: ["Role-based access control", "Encrypted in transit and at rest", "Regular backups"],
    pending: false,
  },
];

export function TrustSection() {
  return (
    <section
      id="08-trust-proof"
      aria-label="Trust and Proof"
      className="border-b border-border px-8 py-24 sm:px-16"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <Eyebrow>08 — Trust</Eyebrow>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card, i) => (
            <Reveal key={card.title} delayMs={i * 60}>
              <div className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-6">
                <h3 className="font-display text-sm font-semibold text-foreground">
                  {card.title}
                </h3>
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
    </section>
  );
}
