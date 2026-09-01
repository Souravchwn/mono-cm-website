import type { SVGProps } from "react";
import { GridGlow } from "@/components/GridGlow";
import { ParallaxLayer } from "@/components/ParallaxLayer";

// lucide-react dropped brand/logo icons; these are minimal inline
// equivalents rather than pulling in a second icon package for two glyphs.
function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.15 1.46-2.15 2.96V21h-4V9Z" />
    </svg>
  );
}
function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2.5h3.3l-7.2 8.2 8.5 10.8h-6.6l-5.2-6.6-5.9 6.6H2.5l7.7-8.7L2 2.5h6.8l4.7 6.1 5.4-6.1Zm-1.2 17h1.8L7.4 4.4H5.5l12.2 15.1Z" />
    </svg>
  );
}

/**
 * context/sections/10-footer.md: the spec doesn't detail footer content beyond
 * "standard — nav links, legal, social, contact." Nav links only point to
 * sections that actually exist. Social/legal links below are real destinations
 * we don't have yet (user-confirmed: ship them now as visibly-pending, not as
 * silent 404s — see PENDING_LINKS below and context/data-integrity.md).
 */
const NAV_LINKS = [
  { label: "Product", href: "#04-product-modules" },
  { label: "Real Product UI", href: "#05-real-product-ui" },
  { label: "Waitlist", href: "#09-waitlist" },
];

// href points at the footer's own id — an inert no-op scroll rather than a
// fake external URL that would 404. Swap to the real destination and drop
// `pending` per link once it exists; no other markup changes needed.
const PENDING_LINKS = [
  { label: "LinkedIn", icon: LinkedinIcon, href: "#10-footer" },
  { label: "X (Twitter)", icon: XIcon, href: "#10-footer" },
];

export function Footer() {
  return (
    <footer id="10-footer" className="relative overflow-hidden px-8 py-12 sm:px-16">
      <GridGlow />
      <ParallaxLayer
        speed={0.2}
        className="pointer-events-none absolute bottom-[-4rem] left-[-6rem] h-[22rem] w-[22rem] rounded-full blur-[80px]"
        style={{ background: "var(--glow-emerald)" }}
      />
      {/* Was a single wrapping row of links — the last thing a sceptical buyer
          sees, and it read as a placeholder. Same links, same pending states,
          grouped under labels so the page closes properly. */}
      <div className="relative mx-auto flex max-w-5xl flex-col gap-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div className="col-span-2 flex flex-col gap-2.5 sm:col-span-1">
            <span className="flex items-center gap-2.5 font-display text-sm font-semibold text-foreground">
              <span
                aria-hidden="true"
                className="h-4 w-4 rounded-[4px] bg-gradient-to-br from-accent-bright to-cyan"
                style={{ boxShadow: "0 0 14px rgba(52,211,153,0.45), inset 0 1px 1px rgba(255,255,255,0.4)" }}
              />
              Mono CM
            </span>
            <p className="max-w-xs text-sm text-foreground-muted">
              The production-centric construction engine.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2.5">
            <h2 className="font-display text-[11px] font-medium tracking-wide text-foreground-muted uppercase">
              Platform
            </h2>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="w-fit text-sm text-foreground-muted transition-colors duration-200 hover:text-accent-bright"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5">
            <h2 className="font-display text-[11px] font-medium tracking-wide text-foreground-muted uppercase">
              Company
            </h2>
            <a
              href="#10-footer"
              title="Coming soon — real link to follow"
              aria-disabled="true"
              className="w-fit text-sm text-foreground-muted/50 italic decoration-dashed underline-offset-4 hover:underline"
            >
              Privacy Policy
            </a>
            <div className="mt-1 flex items-center gap-4">
              {PENDING_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  title={`${link.label} — coming soon`}
                  aria-disabled="true"
                  aria-label={`${link.label} (coming soon)`}
                  className="text-foreground-muted/50 transition-colors duration-200 hover:text-foreground-muted"
                >
                  <link.icon width={16} height={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <span className="text-sm text-foreground-muted">
            © {new Date().getFullYear()} Mono CM. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
