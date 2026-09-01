"use client";

/** Height of the fixed header (h-16), so a section's top isn't hidden under it. */
const HEADER_OFFSET = 64;

/**
 * Scroll to a top-level section by id.
 *
 * Plain `href="#id"` anchors are unreliable on this page and it isn't the browser's
 * fault: most sections are a tall wrapper (200–300vh) containing a `position: sticky`
 * viewport, so an element *inside* that sticky child has a document position that
 * changes as the page scrolls toward it — the browser picks a target from the current
 * layout, scrolls, the sticky child re-pins, and the element is no longer where the
 * scroll was aimed. The header CTA pointed at `#hero-email`, an input inside exactly
 * such a subtree (and one that unmounts once the Hero form is submitted, leaving a
 * dead target).
 *
 * Targeting the *section wrapper* instead is stable — its offset doesn't depend on
 * scroll position — so this resolves the wrapper's top once and jumps there.
 *
 * `behavior: "auto"` rather than smooth on purpose: `globals.css` sets
 * `scroll-behavior: smooth` globally, and animating 13,000+ px through six
 * scroll-scrubbed GSAP timelines and two WebGL scenes drops frames badly enough to
 * look broken. An instant jump to a section boundary is both more reliable and
 * calmer than a long smooth scroll the main thread can't keep up with.
 */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
}
