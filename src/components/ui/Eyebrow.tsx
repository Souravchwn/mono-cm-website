export function Eyebrow({ children }: { children: string }) {
  return (
    <span className="text-label font-display font-medium tracking-wide text-accent-bright uppercase">
      {children}
    </span>
  );
}
