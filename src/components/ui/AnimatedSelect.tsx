"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Animated dropdown, adapted from Shatlyk1011's "Animated Dropdown"
 * (21st.dev / emerald-ui): a trigger showing the current selection, a menu that
 * expands and collapses smoothly with its items staggering in, a chevron that
 * flips, and click-outside to dismiss.
 *
 * Two deliberate departures from the original, both consistent with how this
 * project has adapted every other community component (see design.md →
 * "borrow the technique, not the palette"):
 *
 *  1. **No framer-motion.** The original animates with it; this site has no
 *     such dependency and deliberately standardises on GSAP for scroll work and
 *     plain CSS for state transitions. Pulling in a second animation runtime for
 *     one dropdown isn't worth it when the whole effect is an opacity/transform
 *     transition plus a per-item delay — so it reuses `--ease-expo`, the easing
 *     token already shared by `.press-feedback` and `.card-lift`.
 *
 *  2. **Built as a real listbox, not a div menu.** This replaces a native
 *     `<select>`, which came with keyboard support, a mobile picker, autofill and
 *     screen-reader semantics for free. Those are re-implemented here rather than
 *     dropped: APG select-only combobox roles, `aria-activedescendant`, full
 *     keyboard control (arrows, Home/End, Enter/Space, Escape, type-ahead), and a
 *     hidden native input so the value still submits and autofills with the form.
 */
export function AnimatedSelect({
  id,
  name,
  labelId,
  options,
  value,
  onChange,
  triggerRef: externalTriggerRef,
  className = "",
}: {
  id: string;
  name?: string;
  /** id of the visible <label>, so the trigger announces "<label>, <value>". */
  labelId: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  /** Optional handle on the trigger — Section 09 focuses it after the Hero handoff. */
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const internalTriggerRef = useRef<HTMLButtonElement>(null);
  const triggerRef = externalTriggerRef ?? internalTriggerRef;
  const [open, setOpen] = useState(false);
  // Which option the keyboard is on. Kept separate from `value`: browsing with
  // the arrow keys shouldn't commit a selection until Enter.
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.indexOf(value)));
  // Buffer for type-ahead ("ge" → General Contractor), cleared after a pause.
  const typeAhead = useRef({ buffer: "", timer: 0 });

  const optionId = (index: number) => `${listId}-option-${index}`;

  function commit(index: number) {
    onChange(options[index]);
    setActiveIndex(index);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function openAt(index: number) {
    setActiveIndex(Math.min(Math.max(index, 0), options.length - 1));
    setOpen(true);
  }

  // Click-outside — the behaviour the original component is built around.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        if (open) setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        else openAt(activeIndex);
        return;
      case "ArrowUp":
        event.preventDefault();
        if (open) setActiveIndex((i) => Math.max(i - 1, 0));
        else openAt(activeIndex);
        return;
      case "Home":
        if (open) {
          event.preventDefault();
          setActiveIndex(0);
        }
        return;
      case "End":
        if (open) {
          event.preventDefault();
          setActiveIndex(options.length - 1);
        }
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        if (open) commit(activeIndex);
        else openAt(activeIndex);
        return;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        return;
      case "Tab":
        setOpen(false);
        return;
    }

    // Type-ahead: jump to the first option starting with what's been typed.
    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      window.clearTimeout(typeAhead.current.timer);
      typeAhead.current.buffer += event.key.toLowerCase();
      typeAhead.current.timer = window.setTimeout(() => {
        typeAhead.current.buffer = "";
      }, 600);
      const match = options.findIndex((o) => o.toLowerCase().startsWith(typeAhead.current.buffer));
      if (match !== -1) {
        setActiveIndex(match);
        if (!open) setOpen(true);
      }
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        // Label first, then the current value — "Company type, General Contractor".
        aria-labelledby={`${labelId} ${id}`}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onClick={() => (open ? setOpen(false) : openAt(activeIndex))}
        onKeyDown={onKeyDown}
        className="panel-ring flex h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-surface px-4 text-left text-sm text-foreground transition-colors duration-200 hover:border-accent-bright/40 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 text-foreground-muted ${reducedMotion ? "" : "transition-transform duration-200"} ${
            open ? "rotate-180" : ""
          }`}
          style={reducedMotion ? undefined : { transitionTimingFunction: "var(--ease-expo)" }}
        />
      </button>

      {/*
        Stays mounted so it can animate out. `visibility` (Tailwind's `invisible`)
        rather than `display`/unmount because it also removes the list from the
        accessibility tree while closed, and — unlike `display` — it can be
        transitioned, so the fade finishes before it disappears.
      */}
      <ul
        id={listId}
        role="listbox"
        aria-labelledby={labelId}
        style={{
          transitionTimingFunction: "var(--ease-expo)",
          // Exit faster than enter, per the motion guidance in design.md.
          transitionDuration: reducedMotion ? "1ms" : open ? "200ms" : "130ms",
        }}
        className={`panel-floating absolute top-[calc(100%+0.5rem)] right-0 left-0 z-30 max-h-60 overflow-auto rounded-lg py-1.5 transition-[opacity,transform,visibility] ${
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-1 scale-[0.98] opacity-0"
        }`}
      >
        {options.map((option, index) => (
          <li
            key={option}
            id={optionId(index)}
            role="option"
            aria-selected={option === value}
            // pointerdown, not click: the click-outside handler also listens on
            // pointerdown, and mousedown-then-blur would otherwise race it.
            onPointerDown={(event) => {
              event.preventDefault();
              commit(index);
            }}
            onPointerEnter={() => setActiveIndex(index)}
            style={{
              transitionTimingFunction: "var(--ease-expo)",
              // The original's staggered reveal. Only on the way in — staggering
              // the exit as well makes dismissal feel sluggish.
              transitionDelay: reducedMotion || !open ? "0ms" : `${index * 28}ms`,
            }}
            className={`mx-1.5 cursor-pointer rounded-md px-3 py-2 text-sm transition-[opacity,transform] duration-200 ${
              open ? "translate-y-0 opacity-100" : "-translate-y-0.5 opacity-0"
            } ${
              index === activeIndex ? "bg-accent/12 text-foreground" : "text-foreground-muted"
            } ${option === value ? "font-medium text-accent-bright" : ""}`}
          >
            {option}
          </li>
        ))}
      </ul>

      {/* Keeps the value in the form's own data and reachable by autofill, which
          a div-based dropdown would otherwise lose along with the <select>. */}
      {name && <input type="hidden" name={name} value={value} />}
    </div>
  );
}
