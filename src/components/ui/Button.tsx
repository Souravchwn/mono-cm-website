import type { ButtonHTMLAttributes } from "react";

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      // `press-feedback` (globals.css) carries the transition + 0.97 active
      // scale; it replaces the old `transition-colors duration-200`, which
      // animated the hover recolour and nothing else — there was no press
      // state at all. `hover:brightness-` rather than a second background
      // class so callers that pass their own gradient still get a hover.
      className={`press-feedback inline-flex h-12 min-w-11 cursor-pointer items-center justify-center rounded-lg bg-accent px-6 font-display text-sm font-semibold text-on-accent hover:bg-accent-bright hover:brightness-105 focus-visible:outline-2 focus-visible:outline-ring ${className}`}
      {...props}
    />
  );
}
