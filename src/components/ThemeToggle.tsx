"use client";

import { useSyncExternalStore } from "react";
import { SunIcon, MoonIcon } from "@/components/icons";

const STORAGE_KEY = "mono-cm-theme";
type Theme = "light" | "dark";

/**
 * A tiny external store instead of useState+useEffect: the inline script in
 * layout.tsx already sets data-theme on <html> before hydration, so the
 * client's real snapshot is available immediately — useSyncExternalStore is
 * the API built for exactly this "differs from the server snapshot" case,
 * where a manual effect would otherwise force an extra render pass.
 */
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function getServerSnapshot(): Theme | null {
  return null;
}

function setTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(STORAGE_KEY, next);
  listeners.forEach((listener) => listener());
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (theme === null) {
    return <div className="h-11 w-11" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-lg transition-colors duration-200 hover:border-accent-bright/50 focus-visible:outline-2 focus-visible:outline-ring"
    >
      {theme === "light" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
