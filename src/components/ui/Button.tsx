import type { ButtonHTMLAttributes } from "react";

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-12 min-w-11 cursor-pointer items-center justify-center rounded-lg bg-accent px-6 font-display text-sm font-semibold text-on-accent transition-colors duration-200 hover:bg-accent-bright focus-visible:outline-2 focus-visible:outline-ring ${className}`}
      {...props}
    />
  );
}
