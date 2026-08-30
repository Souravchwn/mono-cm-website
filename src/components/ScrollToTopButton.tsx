"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ArrowUpIcon } from "@/components/icons";

const SHOW_AFTER_PX = 600;

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
      aria-label="Scroll to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-lg transition-[opacity,transform] duration-200 hover:border-accent-bright/50 focus-visible:outline-2 focus-visible:outline-ring ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <ArrowUpIcon />
    </button>
  );
}
