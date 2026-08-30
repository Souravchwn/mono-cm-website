/**
 * context/data-integrity.md: figures in Section 05 are demo data and must carry a
 * persistent, visible label — not a footnote easy to miss. This is that label.
 */
export function DemoDataBadge() {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
        <path d="M8 1 1 14h14L8 1Zm0 4.5c.4 0 .7.3.7.7v3.6a.7.7 0 0 1-1.4 0V6.2c0-.4.3-.7.7-.7Zm0 6.8a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7Z" />
      </svg>
      Demo data — for illustration only
    </span>
  );
}
