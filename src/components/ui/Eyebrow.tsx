/**
 * Section label. Deliberately no section numbers ("02 — ...") — those were
 * internal spec/dev numbering that had leaked into visitor-facing copy (see
 * design.md → "Eyebrow: abstract, not numbered"). A small glowing accent dot
 * marks it as a label without exposing an internal index.
 */
export function Eyebrow({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-label font-display font-medium tracking-[0.08em] text-accent-bright uppercase">
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent-bright"
        style={{ boxShadow: "0 0 8px rgba(52,211,153,0.65)" }}
      />
      {children}
    </span>
  );
}
