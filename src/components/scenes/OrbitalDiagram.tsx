"use client";

/**
 * Adapted from the "radial-orbital-timeline" community component (21st.dev).
 * Real changes from the pasted source, see design.md → "Orbital diagram
 * replaces the 3D scene" for the full rationale:
 *  - Dropped the shadcn Badge/Button/Card imports — they key off CSS tokens
 *    (--primary, --card, --muted-foreground, ...) this project never defines,
 *    so they'd render unstyled here. Replaced with plain elements on this
 *    project's own tokens (--surface, --foreground, --accent-bright, --cyan).
 *  - Dropped "date"/"status" (COMPLETED/IN PROGRESS/PENDING) and the "Energy
 *    Level: N%" stat bar — those are project-timeline concepts (with
 *    fabricated-looking percentages) that don't apply to a cause-and-effect
 *    diagram and would read as an invented metric on a live site. Replaced
 *    with a tier badge (Source / Effect / Outcome) and a plain description.
 *  - Removed the unused `viewMode` state (only one mode ever existed).
 *  - Rotation is a CSS `@keyframes` animation (globals.css → orbit-spin), not
 *    a JS `setInterval` writing a new `transform` into React state ~20x/sec —
 *    that version fought its own `transition-all duration-700` (permanently
 *    mid-transition toward an already-stale target) and read as a visible
 *    stutter. Each node's outer wrapper gets a *static* per-index angle
 *    (`rotate(baseAngle) translateX(radius)`); the shared parent's
 *    `animate-orbit-spin` class does the continuous spin, and each node's
 *    inner content runs the identical keyframe in reverse
 *    (`animate-orbit-counter-spin`) so icons/labels stay upright rather than
 *    tumbling as they orbit. Gated on prefers-reduced-motion, and paused
 *    (not stopped — `animation-play-state`, which freezes mid-rotation
 *    rather than snapping) whenever a node is open.
 *  - Fills its parent container instead of a hardcoded `h-screen`.
 *  - `expandedId`/`onExpandedChange` make "which node is open" optionally
 *    controlled, so CauseEffectSection/BusinessOutcomesSection/
 *    ComparisonSection can drive it from scroll position while still letting
 *    a click override it directly.
 *  - Radius/center-orb/orbit-ring are sized in `cqw` (container query width)
 *    against a `@container` on the root, not fixed pixels. A fixed radius
 *    (170px) was fine in Section 03's max-w-xl container but overflowed
 *    Section 07's narrower max-w-md one — the "Material" node's label and
 *    card collided with "Labor" next to it. `cqw` scales with whatever box
 *    this is actually placed in, so the same component reads correctly at
 *    every size it's used at, and "make the orbit bigger" is one number
 *    (ORBIT_CQW) instead of a per-section pixel guess.
 */
import { ArrowRight, Link as LinkIcon, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export type OrbitalTier = "source" | "effect" | "outcome";

export interface OrbitalNode {
  id: string;
  label: string;
  tier: OrbitalTier;
  description: string;
  icon: LucideIcon;
  relatedIds: string[];
}

const TIER_LABEL: Record<OrbitalTier, string> = {
  source: "Source",
  effect: "Effect",
  outcome: "Outcome",
};

// Tailwind can't see these composed at runtime, so each tier's classes are
// spelled out in full rather than built from a template string.
const TIER_STYLES: Record<OrbitalTier, { node: string; badge: string; glow: string; accent: string }> = {
  source: {
    node: "border-accent-bright text-accent-bright",
    badge: "border-accent-bright/40 bg-accent/10 text-accent-bright",
    glow: "rgba(52,211,153,0.4)",
    accent: "linear-gradient(90deg, var(--color-accent-bright), var(--color-cyan))",
  },
  effect: {
    node: "border-cyan text-cyan",
    badge: "border-cyan/40 bg-cyan/10 text-cyan",
    glow: "rgba(34,211,238,0.4)",
    accent: "linear-gradient(90deg, var(--color-cyan), var(--color-accent-bright))",
  },
  outcome: {
    node: "border-accent-bright text-accent-bright",
    badge: "border-accent-bright/40 bg-accent/10 text-accent-bright",
    glow: "rgba(52,211,153,0.55)",
    accent: "linear-gradient(90deg, var(--color-accent-bright), var(--color-cyan))",
  },
};

// Orbit radius as a percentage of the diagram's own width (container query
// units — see file header). Bump this one number to make every placement's
// orbit bigger/smaller at once. Kept clear of the card dock on the right —
// see RING_CENTER_LEFT and the dock's width below, which are sized against
// this same number so the ring/nodes never reach the dock. Section 07's
// narrower `max-w-lg` container is the tightest fit of the three placements
// (its dock hits its min-width clamp, so it keeps a larger *share* of the
// container than the others) — sized against that worst case, not Section
// 03's roomier one.
const ORBIT_CQW = 23;

// The ring's own center, off-center to the left — frees a strip on the right
// for the card dock (see OrbitalDiagram doc comment on the dock below). Used
// for every element that used to anchor at the literal center (50%). Kept as
// a plain number (not a "34%" string) so the leader-line effect below can
// reuse the same value when computing the ring's actual center in pixels.
const RING_CENTER_LEFT_PCT = 32;
const RING_CENTER_LEFT = `${RING_CENTER_LEFT_PCT}%`;

export function OrbitalDiagram({
  nodes,
  ariaLabel,
  className = "",
  expandedId: controlledExpandedId,
  onExpandedChange,
}: {
  nodes: OrbitalNode[];
  ariaLabel: string;
  className?: string;
  /** Pass to drive expansion externally (e.g. from scroll); omit for click-only. */
  expandedId?: string | null;
  onExpandedChange?: (id: string | null) => void;
}) {
  const reducedMotion = useReducedMotion();
  const isControlled = controlledExpandedId !== undefined;
  const [internalExpandedId, setInternalExpandedId] = useState<string | null>(null);
  const expandedId = isControlled ? controlledExpandedId : internalExpandedId;

  // Rotation pauses whenever a node is open, no matter who opened it — a
  // spinning orbit under a card the visitor is trying to read looks broken.
  const spinning = !reducedMotion && expandedId === null;

  const setExpanded = (id: string | null) => {
    if (isControlled) onExpandedChange?.(id);
    else setInternalExpandedId(id);
  };

  const toggleNode = (id: string) => setExpanded(expandedId === id ? null : id);

  const expandedNode = nodes.find((n) => n.id === expandedId) ?? null;
  const relatedToExpanded = expandedNode?.relatedIds ?? [];

  // The expanded card lives in one fixed dock (see the dock render below) —
  // same spot no matter which node is open, so it can never collide with a
  // neighboring node the way a card that popped open beside its own node
  // used to. The only thing that moves is a leader line from the active
  // node back to the dock, and that line has to be measured, not computed
  // from each node's static base angle: the ring keeps spinning right up
  // until the moment a node opens, so a node's actual on-screen position is
  // baseAngle *plus* however far the CSS keyframe animation had turned
  // before it paused, which JS never knows. Rotation is already paused by
  // the time this effect runs (same render that sets expandedId), so a
  // single measurement against real DOM geometry is stable.
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dockRef = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number; cx: number; cy: number } | null>(
    null,
  );

  useEffect(() => {
    // No reset to null on close: the line is only ever rendered when
    // `expandedNode` is also truthy (see the JSX below), so a stale value
    // sitting in state between closes is harmless and avoids a setState
    // call purely to unset something nothing will read anyway.
    if (!expandedId) return;
    const containerEl = containerRef.current;
    const nodeEl = nodeRefs.current[expandedId];
    const dockEl = dockRef.current;
    if (!containerEl || !nodeEl || !dockEl) return;
    const containerRect = containerEl.getBoundingClientRect();
    const nodeRect = nodeEl.getBoundingClientRect();
    const dockRect = dockEl.getBoundingClientRect();

    const nodeCenterX = nodeRect.left + nodeRect.width / 2 - containerRect.left;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2 - containerRect.top;
    const nodeRadius = nodeRect.width / 2;
    const x2 = dockRect.left - containerRect.left;
    // Clamp to the dock's own vertical span so the line always lands on the
    // card itself rather than floating above/below it for nodes far from
    // the dock's height.
    const y2 =
      Math.max(dockRect.top + 16, Math.min(dockRect.bottom - 16, nodeRect.top + nodeRect.height / 2)) -
      containerRect.top;

    // Start from the node's outer edge, not its center — a center-anchored
    // line drew a stray stroke straight across the node's own icon glyph
    // before it ever left the circle. Offsetting by nodeRadius along the
    // center-to-dock direction puts the visible start exactly on the
    // circle's rim, pointed toward where the line is headed.
    const toDockLen = Math.hypot(x2 - nodeCenterX, y2 - nodeCenterY) || 1;
    const x1 = nodeCenterX + ((x2 - nodeCenterX) / toDockLen) * nodeRadius;
    const y1 = nodeCenterY + ((y2 - nodeCenterY) / toDockLen) * nodeRadius;

    // A straight chord from a ring node to the dock cuts back across the
    // ring's own interior — exactly where its neighbors live — so at some
    // rotation angles it grazes right over another node. Bowing the curve
    // outward, away from the ring's center, routes it around that interior
    // instead of through it. `sign` picks whichever perpendicular direction
    // actually points away from center (the other one would bow the curve
    // the wrong way, back toward the ring).
    const centerX = containerRect.width * (RING_CENTER_LEFT_PCT / 100);
    const centerY = containerRect.height / 2;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    let nx = -(y2 - y1) / len;
    let ny = (x2 - x1) / len;
    const sign = nx * (mx - centerX) + ny * (my - centerY) < 0 ? -1 : 1;
    nx *= sign;
    ny *= sign;
    const bow = Math.min(56, Math.max(20, len * 0.22));

    setLine({ x1, y1, x2, y2, cx: mx + nx * bow, cy: my + ny * bow });
  }, [expandedId]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className={`@container relative h-full w-full ${className}`}
      onClick={(e) => {
        if (e.currentTarget === e.target) setExpanded(null);
      }}
    >
      {/* Center pulse — the production event itself */}
      <div
        className="pointer-events-none absolute top-1/2 z-10 flex h-[clamp(3.5rem,18cqw,5.5rem)] w-[clamp(3.5rem,18cqw,5.5rem)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-accent-bright to-cyan"
        style={{ left: RING_CENTER_LEFT }}
      >
        {!reducedMotion && (
          <>
            <div className="absolute h-[125%] w-[125%] animate-ping rounded-full border border-accent-bright/30 opacity-70" />
            <div
              className="absolute h-[175%] w-[175%] animate-ping rounded-full border border-cyan/20 opacity-50"
              style={{ animationDelay: "0.5s" }}
            />
          </>
        )}
        <div className="h-[45%] w-[45%] rounded-full bg-background/80" />
      </div>
      <div
        className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border"
        style={{ left: RING_CENTER_LEFT, height: `${ORBIT_CQW * 2}cqw`, width: `${ORBIT_CQW * 2}cqw` }}
      />

      {/* Spins continuously (CSS animation, paused via animation-play-state
          while a node is open) — every node's wrapper below has a *static*
          angle offset; this is the only thing actually rotating.
          `z-20` here is load-bearing, not decorative: an animated `transform`
          makes this div its own stacking context, so a card's `zIndex: 200`
          deep inside only wins comparisons against its *siblings within that
          context* — against the center orb (an explicit z-10 sibling one
          level up), what matters is this whole layer's own z-index. Without
          it (z-index:auto), the orb's explicit z-10 always wins regardless of
          what any node inside sets, which is exactly why the pulse orb was
          rendering on top of an expanded card's text. */}
      <div
        className={`absolute inset-0 z-20 ${reducedMotion ? "" : "animate-orbit-spin"}`}
        // transformOrigin has to match RING_CENTER_LEFT explicitly: this layer
        // is a full-size `inset-0` box, so its default rotation pivot is its
        // own center (50%, the container's literal middle) — not the ring's
        // actual center at RING_CENTER_LEFT. Left at the default, every node
        // (a child of this layer) traces a circle around the wrong point, so
        // the moment the spin animation pauses anywhere but angle 0, nodes
        // drift off the (separately rendered, non-rotating) ring line instead
        // of riding on it.
        style={{ animationPlayState: spinning ? "running" : "paused", transformOrigin: `${RING_CENTER_LEFT} 50%` }}
      >
        {nodes.map((node, index) => {
          // Rounded to 3 decimals — same server/client hydration mismatch as
          // before (e.g. 1/6*360 has no exact binary float representation,
          // so "60deg" vs "60.00000000000001deg" can differ by environment).
          const baseAngle = Number(((index / nodes.length) * 360).toFixed(3));
          const isExpanded = expandedId === node.id;
          const isRelated = relatedToExpanded.includes(node.id);
          // Recedes everything not part of the open node's story — makes the
          // open card read as elevated above the ring rather than fighting
          // its neighbors for attention, which a same-opacity ring couldn't:
          // dimming is what "elevated" actually looks like next to a card
          // that, geometrically, still sits close to an adjacent node.
          const isDimmed = expandedId !== null && !isExpanded && !isRelated;
          const tier = TIER_STYLES[node.tier];
          const Icon = node.icon;

          return (
            <div
              key={node.id}
              className="absolute top-1/2 h-0 w-0"
              style={{ left: RING_CENTER_LEFT, transform: `rotate(${baseAngle}deg)` }}
            >
              {/* translateX and the counter-angle below are deliberately two
                  separate elements, not one combined transform string: CSS
                  composes a multi-function `transform` into a single matrix
                  rather than applying each function in its own successive
                  frame, so "translateX(R) rotate(-A)" on one element does not
                  mean "move out, then rotate in place" the way nesting does. */}
              <div className="absolute top-0 left-0 h-0 w-0" style={{ transform: `translateX(${ORBIT_CQW}cqw)` }}>
                {/* Cancels this node's own fixed baseAngle offset (position is
                    already set by the two wrappers above); the counter-spin
                    animation below cancels only the parent's continuous spin.
                    Together the content's on-screen rotation is always 0. */}
                <div className="absolute top-0 left-0 h-0 w-0" style={{ transform: `rotate(${-baseAngle}deg)` }}>
                  <div
                    className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                      reducedMotion ? "" : "animate-orbit-counter-spin"
                    }`}
                    style={{
                      animationPlayState: spinning ? "running" : "paused",
                      zIndex: isExpanded ? 200 : 1,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode(node.id);
                    }}
                  >
                    <div
                      ref={(el) => {
                        nodeRefs.current[node.id] = el;
                      }}
                      className={`flex h-[clamp(2.75rem,11cqw,3.75rem)] w-[clamp(2.75rem,11cqw,3.75rem)] items-center justify-center rounded-full border-2 bg-surface transition-[transform,opacity,filter] duration-300 ${
                        isExpanded
                          ? `scale-125 opacity-100 ${tier.node}`
                          : isRelated
                            ? `opacity-100 ${tier.node}`
                            : `opacity-90 border-border text-foreground-muted ${isDimmed ? "opacity-25 blur-[0.5px]" : ""}`
                      }`}
                      style={isExpanded ? { boxShadow: `0 0 28px ${tier.glow}` } : undefined}
                    >
                      <Icon size={18} />
                    </div>
                    <div
                      // `whitespace-nowrap` used to force every label onto one
                      // line — fine for "Material"/"Labor", but "Cash Flow →
                      // Forecast" at ~150px wide reached far enough past its
                      // own icon to peek out from under the docked card on
                      // narrower placements (Section 07). Capped to a width
                      // that wraps only the long labels, roughly halving the
                      // worst case's horizontal footprint.
                      className={`absolute top-[calc(100%+0.6rem)] left-1/2 w-max max-w-24 -translate-x-1/2 text-center text-xs font-semibold transition-all duration-300 ${
                        isExpanded
                          ? "scale-110 text-foreground"
                          : isDimmed
                            ? "text-foreground-muted opacity-25"
                            : "text-foreground-muted"
                      }`}
                    >
                      {node.label}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leader line, active node to the dock — an SVG quadratic curve rather
          than a rotated/positioned div or a straight `<line>`: the endpoints
          and control point are just measured/derived DOM coordinates (see
          the effect above), so the browser draws the curve directly instead
          of this code hand-computing an angle/length for a div transform.
          Bowed away from the ring's center (not a straight chord) so it
          routes around the ring's interior — where a straight line would
          cut across a neighboring node at some rotation angles — rather
          than through it. Sits above the rotating ring (z-30) so it's never
          caught inside that layer's own stacking context. */}
      <svg className="pointer-events-none absolute inset-0 z-30 h-full w-full" aria-hidden="true">
        {line && expandedNode && (
          <>
            <path
              d={`M ${line.x1} ${line.y1} Q ${line.cx} ${line.cy} ${line.x2} ${line.y2}`}
              fill="none"
              stroke={TIER_STYLES[expandedNode.tier].glow}
              strokeWidth={2}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 5px ${TIER_STYLES[expandedNode.tier].glow})` }}
            />
            <circle cx={line.x1} cy={line.y1} r={3} fill={TIER_STYLES[expandedNode.tier].glow} />
          </>
        )}
      </svg>

      {/* The dock — one fixed home for the expanded card, right of the ring.
          It used to open beside whichever node was clicked and float toward
          whatever direction looked clearest; that meant its position (and
          the collision-avoidance to compute it) changed per click. Docking
          it removes the collision case entirely — nothing else ever occupies
          this spot — and only the leader line above has to track the active
          node. Always mounted (not conditionally rendered) so it can
          transition in/out smoothly instead of popping. */}
      <div
        ref={dockRef}
        className={`absolute top-1/2 right-0 z-30 w-[clamp(10rem,29cqw,14rem)] -translate-y-1/2 overflow-hidden rounded-2xl transition-[opacity,transform] duration-300 ease-out ${
          expandedNode ? "translate-x-0 scale-100 opacity-100" : "pointer-events-none translate-x-2 scale-95 opacity-0"
        }`}
        style={{
          background: "linear-gradient(160deg, var(--color-surface-2), var(--color-surface))",
          boxShadow: expandedNode
            ? `0 1px 0 rgba(255,255,255,0.06) inset, 0 0 0 1px var(--color-border), 0 0 40px -12px ${TIER_STYLES[expandedNode.tier].glow}, 0 32px 60px -22px rgba(0,0,0,0.85)`
            : "0 0 0 1px var(--color-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {expandedNode && (
          <>
            <div className="h-[3px] w-full" style={{ background: TIER_STYLES[expandedNode.tier].accent }} />
            <div className="p-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-surface ${TIER_STYLES[expandedNode.tier].node}`}
                  style={{ boxShadow: `0 0 16px ${TIER_STYLES[expandedNode.tier].glow}` }}
                >
                  <expandedNode.icon size={15} />
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${TIER_STYLES[expandedNode.tier].badge}`}
                >
                  {TIER_LABEL[expandedNode.tier]}
                </span>
              </div>
              <h3 className="mt-3 font-display text-base font-semibold tracking-tight text-foreground">
                {expandedNode.label}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-foreground-muted">{expandedNode.description}</p>

              {expandedNode.relatedIds.length > 0 && (
                <div className="mt-3 border-t border-border pt-2.5">
                  <div className="mb-1.5 flex items-center gap-1 text-[10px] font-medium tracking-wide text-foreground-muted uppercase">
                    <LinkIcon size={9} />
                    Connected
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {expandedNode.relatedIds.map((relId) => {
                      const related = nodes.find((n) => n.id === relId);
                      if (!related) return null;
                      return (
                        <button
                          key={relId}
                          type="button"
                          className="panel-ring inline-flex items-center gap-0.5 rounded bg-background px-1.5 py-0.5 text-[11px] text-foreground-muted transition-colors hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleNode(relId);
                          }}
                        >
                          {related.label}
                          <ArrowRight size={8} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
