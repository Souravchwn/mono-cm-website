/**
 * Shared background treatment for Waitlist and Footer — a faint grid plus a
 * soft radial glow, bookending the page with the same visual language the
 * Hero/orbital sections already use elsewhere. Purely decorative, so it's a
 * plain server component (no refs, no motion) rather than a client one.
 */
export function GridGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="bg-blueprint-grid absolute inset-0"
        style={{
          maskImage: "radial-gradient(ellipse 70% 65% at 50% 50%, #000 35%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 65% at 50% 50%, #000 35%, transparent 100%)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        style={{ background: "var(--glow-emerald)" }}
      />
    </div>
  );
}
