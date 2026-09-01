"use client";

import { scrollToSection } from "@/lib/scroll-to-section";

const NAV_LINKS = [
  { label: "Platform", href: "#02-production-engine" },
  { label: "Product", href: "#04-product-modules" },
  { label: "Proof", href: "#08-trust-proof" },
];

/**
 * Site nav — sticky glass bar over the hero. The homepage had no persistent
 * nav at all before this; every direction in the Procore/Fieldwire comparison
 * (see design.md → "Hero direction v2") included one, and its absence was
 * part of why the page read as unfinished rather than a real product.
 */
export function Header() {
  return (
    <header
      className="fixed inset-x-0 top-0 z-40 bg-background/60 backdrop-blur-md"
      style={{ boxShadow: "0 1px 0 var(--color-border)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-10">
        <a
          href="#01-hero"
          className="flex items-center gap-2.5 font-display text-sm font-semibold tracking-tight text-foreground"
        >
          <span
            aria-hidden="true"
            className="h-4 w-4 rounded-[4px] bg-gradient-to-br from-accent-bright to-cyan"
            style={{
              boxShadow: "0 0 14px rgba(52,211,153,0.45), inset 0 1px 1px rgba(255,255,255,0.4)",
            }}
          />
          Mono CM
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-8 sm:flex">
          {/* Same explicit scroll as the CTA: these jump 5,000–13,000px through
              scroll-scrubbed sections, which the global `scroll-behavior: smooth`
              animates frame-by-frame badly enough to read as a hang. */}
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(link.href.slice(1));
              }}
              className="text-sm text-foreground-muted transition-colors duration-150 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          // Was "#hero-email" — an input inside the Hero's sticky, scroll-scrubbed
          // subtree, which the browser can't reliably scroll to (and which
          // disappears once that form is submitted). It also sent the site's
          // primary CTA to a bare email box rather than to the form that actually
          // collects company type and project volume. Both fixed by pointing it at
          // Section 09; `onClick` does the scroll explicitly — see scrollToSection.
          href="#09-waitlist"
          onClick={(event) => {
            event.preventDefault();
            scrollToSection("09-waitlist");
          }}
          className="press-feedback inline-flex h-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-bright to-accent px-4 font-display text-sm font-semibold text-on-accent hover:brightness-105 focus-visible:outline-2 focus-visible:outline-ring"
          style={{
            boxShadow: "0 1px 0 rgba(255,255,255,0.35) inset, 0 10px 20px -8px rgba(16,185,129,0.55)",
          }}
        >
          Claim Early Access
        </a>
      </div>
    </header>
  );
}
