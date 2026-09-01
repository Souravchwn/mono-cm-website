# Scroll-by-Scroll Storyboard

**Status: FILLED — draft v1, implemented.** Per the source spec ("Before Building: Storyboard
First") and `CLAUDE.md`, no scroll-driven animation or 3D work may be implemented for a section
until that section's storyboard below is filled in. This version was drafted and implemented
directly against a **CSS/SVG scroll-scrubbed placeholder**, not the eventual Blender-rendered
asset — see `context/tech-notes.md` for why (no 3D asset pipeline exists yet). Re-validate the
staging/percentages once real 3D assets replace the SVG placeholders; the beats below should carry
over, the rendering technique underneath them will change.

**Implementation pattern used for pinned scenes (01, 02, 03 — see `useScrollScene` in
`src/lib/use-scroll-scene.ts`):** an outer wrapper sized `300vh` tall, with an inner `sticky top-0
h-screen` viewport. A single GSAP timeline is scrubbed to the outer wrapper's scroll progress
(`scrub: true`, no `pin: true` — sticky handles the visual pinning, which avoids GSAP pin
layout-shift issues in Next.js). Percentages below map to timeline progress (0–1) within that scrub
range, not to the page's total scroll. **09 used this pattern originally but no longer does** — see
its section below for why it was dropped (2026-09-01).

**06 and 07 were simplified to reveal-on-scroll** (the `Reveal` component,
`src/components/Reveal.tsx`) rather than pinned scrub scenes — see the implementation notes inline
below each for why. This is a deviation from the original draft, recorded here per `CLAUDE.md`'s
"update the docs when a decision changes" rule.

## 01 — Hero

**REPLACED (2026-09-01) — the beats below are the original blueprint-assembly draft, kept for the
record; the Hero has not built up a building on scroll since "Hero: horizon scene replaces the 3D
building" (design.md, 2026-08-31), and no longer even parallax-drifts a static horizon scene as of
later the same day, once the user pasted 21st.dev's actual "Horizon Hero Section" source and it
turned out to be a real camera flythrough. Current behavior (`HorizonFlythroughScene.tsx`):

```
SCROLL 0%   → Establishing view: dark starfield, a mountain-ridge silhouette, a horizon glow behind
              it. Headline/subheadline/CTA visible and legible throughout, same as the original
              draft's intent.
SCROLL 0–35%  → Camera zooms toward the mountain.
SCROLL 35–60% → Transition: the mountain layers part (drift sideways, fade out) as the camera
              closes in — "flying into the mountain."
SCROLL 60–80% → Camera zooms in close on a lit skyline, revealed standing on a plain beyond the
              hills — invisible until now, both by distance and by being physically blocked by the
              mountains. Understands: the data/production picture was always there, you just
              couldn't see it without the right vantage (this site's own idea, not the reference's
              placeholder sci-fi copy).
SCROLL 80–100% → Camera pulls back out; the city recedes into the distance as the section resolves.
```

Full build/tuning log in `design.md` → "Real flythrough scene, from the actual source" and
`context/sections/01-hero.md`. Original draft, kept for the record:

```
SCROLL 0%   → Blueprint-grid outline of the building footprint (thin low-opacity lines). Headline,
              subheadline, email + CTA are visible and stay fixed/legible for the whole scene.
              Understands: "this is a construction platform, and it's about to show me how."
SCROLL 20%  → Structural frame extrudes: vertical column lines and horizontal beam lines draw in
              (SVG stroke-dashoffset animation) over the blueprint grid.
              Understands: the frame stage of a real building.
SCROLL 40%  → Floor slabs fade/scale in as translucent horizontal planes between frame lines.
              Understands: floors are being added, matching real sequencing.
SCROLL 60%  → MEP pass: thin emerald-accent lines thread through the frame (conduits/routing),
              slightly animated (subtle dash offset drift) to read as "live systems," not static art.
              Understands: this isn't just a shell — services run through it, foreshadowing Section 02.
SCROLL 80%  → Walls fill in as solid panels; the previously-transparent structure starts reading
              as an opaque, real building silhouette.
              Understands: nearly complete — construction is converging.
SCROLL 100% → Fully solid building silhouette, one quiet emerald rim-light pass across the edges,
              settles (no loop). Headline/CTA remain the visual anchor throughout — the building is
              the background story, not a distraction from the CTA.
              Understands: "This is different" — the payoff beat.
```

## 02 — Production Engine
```
SCROLL 0%   → Simple isometric-style grid of room cells (SVG), neutral gray, fully static.
              Understands: this is a floor plan / production surface, not a marketing illustration.
SCROLL 20%  → One cell gets a border highlight + soft glow ("Room selected").
              Understands: something specific just happened on the drawing.
SCROLL 40%  → A label animates in next to the selected cell: "Concrete poured — 25 m³."
              Understands: a real production event, stated in the language a contractor uses.
SCROLL 60%  → Three metric chips fly in, staggered, from the selected cell outward: Material −25 m³,
              Labor +Production Hours, Equipment +Pump Usage.
              Understands: one event, multiple systems reacting — the first concrete proof of the
              cause-and-effect claim, ahead of Section 03's diagram.
SCROLL 80%  → Three more chips: Schedule +Progress, Cash Flow +Cost, Forecast +Updated Projection.
              Understands: it's not just operational systems — financial ones update too.
SCROLL 100% → All six chips visible at once, each connected to the selected cell by a thin static
              line. Key message fades in below: "When production moves on the drawing, everything
              else moves automatically."
              Understands: the core value proposition, now visually earned rather than just stated.
```

## 03 — Cause & Effect / Data Flow
```
SCROLL 0%   → Single "PRODUCTION" node, centered, alone.
              Understands: the diagram starts from one thing.
SCROLL 20%  → Three branch lines draw downward (SVG stroke animation, staggered left → center →
              right) to Material / Labor / Equipment nodes, which fade in as their line arrives.
              Understands: one event visibly forks into three systems.
SCROLL 50%  → The three branches redraw converging back into a single trunk line beneath them.
              Understands: those three systems feed into one shared downstream path (not three
              separate stories).
SCROLL 70%  → "Schedule" node appears on the trunk.
SCROLL 85%  → "Cash Flow" node appears below it.
SCROLL 100% → "Forecast" node appears; the full trunk pulses once (opacity flash, not a color
              change) to mark completion; diagram then holds static — this is the section a visitor
              should be able to redraw from memory, so it must end in a calm, legible resting state.
              Understands: the complete chain, held long enough to memorize.
```

## 06 — Business Outcomes
```
IMPLEMENTATION NOTE (revised from the original draft): the original draft called for a GSAP
Flip-style morph from Section 03's branch-and-trunk tree into a vertical chain. That plugin isn't
part of this project's GSAP install and the morph added real complexity for a section that's
mostly read at rest — so this section uses simple reveal-on-scroll instead (Reveal component, not
a pinned scrub scene). The pill visual language still matches Section 03/07 intentionally.

REVEAL 1  → "Production" pill (emphasized style, matches Section 03's production node).
REVEAL 2–6 → Remaining vertical nodes fade/slide in one at a time, staggered ~90ms apart, in order:
              Material consumption → Labor cost → Equipment utilization → Schedule progress →
              Cash-flow forecast. A thin static connector line sits between each pair.
              Understands: each beat is a plain-language business consequence, not a technical term.
LAST      → Headline "One production event. Six business consequences." and the closing line
              ("Mono CM doesn't just record what happened... it understands what that event means
              for everything else.") settle in below the finished chain.
```

## 07 — Competitive Comparison
```
IMPLEMENTATION NOTE (revised from the original draft): also simplified to reveal-on-scroll, not a
pinned scrub scene — the spec itself says this section should be "studied, not watched," which
argues against pinning it. Re-drawing Section 03's diagram line-by-line again here would also be
repetitive motion the visitor has already seen once; a block fade-in of the already-formed diagram
is enough since it's already been taught.

AT REST   → Left side: "LEGACY MODEL" label + 5 boxes (Drawing / Inventory / Timesheet / Equipment
              / Finance) placed with intentionally uneven spacing/rotation and no connecting
              lines — fragmentation is visually obvious at rest, no animation needed to sell it.
REVEAL    → Right side fades in as a block: the Section 03 diagram, already fully formed (not
              redrawn line-by-line), labeled "MONO CM."
              Understands: fragmentation vs. unification, side by side, without a checkmark table.
```

## 09 — Waitlist
```
DROPPED (2026-09-01), REVISED FROM THE ORIGINAL DRAFT BELOW: this section was pinned to a 200vh
scroll-scrubbed reversal of the Hero's build-up (the beats below), matching the "reverses the hero
animation" line in context/sections/09-waitlist.md. User report: the payoff was effectively
invisible — the 3D building sits at 30% opacity behind the waitlist form, so the ~2 screens of
scroll the pin demanded read as dead scroll with no visible effect, directly ahead of the footer.
Same failure class as the Section 09 overflow bug documented in design.md, just about legibility of
motion instead of layout — the scene was correctly implemented, just not perceptible at the opacity
it needed to sit at to not fight the form in front of it.

Replaced with the same treatment as 06/07: normal document flow, `Reveal` fade-in-on-scroll instead
of a pin, and the building now rests once in its resolved, fully-assembled state (all floors solid,
top floor glowing, no wireframe) rather than mid-transition — "the future of construction," built,
which also reads better against this section's own copy than a wireframe-in-progress did. Drag-to-
orbit and idle auto-rotate on the 3D scene are unchanged; only the scroll-driven material tween is
gone. A `ParallaxLayer` glow orb (also added to the Footer, section 10) now carries this section's
depth motion instead — see design.md → "Waitlist & Footer: dropped the pinned reversal, added
parallax."

Original draft, kept for the record — the Hero-reversal beats this replaced:
SCROLL 0%   → A fully solid building silhouette (same asset/style as the Hero's end state).
SCROLL 20%  → Wall panels lose opacity, edges gain a slight outward drift.
SCROLL 40%  → MEP accent lines fade out (reverse of Hero's 60% beat).
SCROLL 60%  → Floor slabs separate and drift apart slightly.
SCROLL 80%  → Structural frame reduces back to wireframe-only.
SCROLL 100% → Only the blueprint grid remains; the message ("Build the future of construction with
              us.") and the waitlist form solidify into view as the scene settles.
```

*(Sections 04, 05, 08, 09, 10 don't call for scroll-scrubbed scene animation — hover/reveal
interactions only, implemented as standard `ScrollTrigger` fade/stagger-on-enter, not pinned
scenes. No storyboard block needed for those; see `design.md` → Motion for the reveal-animation
baseline.)*

## Reduced motion
Every scene above must have a static fallback: render the SCROLL 100% end-state directly, no
animation, when `prefers-reduced-motion: reduce` is set. This is implemented once at the GSAP setup
level (see `context/tech-notes.md`), not per-section.
