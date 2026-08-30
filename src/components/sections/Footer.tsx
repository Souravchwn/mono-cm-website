/**
 * context/sections/10-footer.md: the spec doesn't detail footer content beyond
 * "standard — nav links, legal, social, contact." Only nav links to sections that
 * actually exist are included; legal/social links are omitted rather than filled
 * with placeholder hrefs that would 404 — confirm real destinations before adding.
 */
const NAV_LINKS = [
  { label: "Product", href: "#04-product-modules" },
  { label: "Real Product UI", href: "#05-real-product-ui" },
  { label: "Waitlist", href: "#09-waitlist" },
];

export function Footer() {
  return (
    <footer id="10-footer" className="px-8 py-12 sm:px-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <span className="font-display text-sm font-semibold text-foreground">Mono CM</span>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-foreground-muted transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <span className="text-sm text-foreground-muted">
          © {new Date().getFullYear()} Mono CM. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
