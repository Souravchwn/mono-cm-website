"use client";

import { useEffect, useState, type RefObject } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { OrbitalNode } from "@/components/scenes/OrbitalDiagram";

/**
 * Shared by every OrbitalDiagram placement (03/06/07) that steps through its
 * nodes as the visitor scrolls, rather than click-only. Maps ScrollTrigger's
 * 0–1 progress over [start, end] to a discrete node index and returns it as
 * a controlled `expandedId` for OrbitalDiagram — a click still works
 * independently (component calls the returned `setExpandedId`) and simply
 * gets overridden by the next scroll tick.
 *
 * Section 03 (pinned, the primary narrative) passes "top top"/"bottom bottom"
 * against its `h-[300vh]` wrapper. Sections 06/07 (normal-flow "same diagram,
 * already resolved" recall placements — see design.md) pass the default,
 * which steps over the section's own natural, un-pinned scroll distance
 * instead of demanding a second full pinned interaction down the page.
 */
export function useOrbitalScrollStep(
  ref: RefObject<HTMLElement | null>,
  nodes: OrbitalNode[],
  { start = "top 75%", end = "bottom 25%" }: { start?: string; end?: string } = {},
) {
  const reducedMotion = useReducedMotion();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (reducedMotion || !ref.current) return;

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start,
      end,
      onUpdate: (self) => {
        if (!self.isActive) return;
        const index = Math.min(nodes.length - 1, Math.floor(self.progress * nodes.length));
        setExpandedId(nodes[index].id);
      },
      // Outside its own scroll window the diagram isn't "telling a story" —
      // it should go back to idle free-orbiting, not sit frozen on whichever
      // node it last landed on. expandedId: null is exactly OrbitalDiagram's
      // "resume auto-rotate" state.
      onLeave: () => setExpandedId(null),
      onLeaveBack: () => setExpandedId(null),
    });
    return () => trigger.kill();
  }, [reducedMotion, ref, nodes, start, end]);

  // reducedMotion: render the SCROLL 100% end-state directly (context/
  // storyboard.md's rule) instead of the stepped-through story.
  const effectiveExpandedId = reducedMotion ? nodes[nodes.length - 1].id : expandedId;

  return { expandedId: effectiveExpandedId, setExpandedId };
}
