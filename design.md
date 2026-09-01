# Mono CM — Design System

This is the human-readable synthesis. The raw token reference (exact hex values, contrast ratios,
spacing scale, motion presets) lives in
[`design-system/mono-cm-website/MASTER.md`](./design-system/mono-cm-website/MASTER.md) — that
file is generated/validated via the `ui-ux-pro-max` skill and this file explains the *reasoning*
behind it. If they ever disagree, `MASTER.md` is the source of truth for exact values; update this
file to match, don't silently drift.

## Brand direction

Dark, premium, technical — closer to Linear, Vercel, Stripe, and Apple than typical construction
software. The construction industry's own software is usually cluttered and dated; Mono CM's
visual language is the opposite of that, on purpose. It's part of the pitch: if the software looks
this considered, the underlying architecture probably is too.

**Direction update (2026-08-30) — "fully futuristic":** the user explicitly chose to push past the
purely restrained Linear/Vercel look toward a more overtly futuristic execution — glassmorphism
panels, glowing gradient-border cards, an electric-cyan complement to the emerald accent, and
(see "3D" below) real interactive WebGL scenes instead of static illustrations. This *extends* the
brand rather than replacing it: same emerald signal color, same Space Grotesk/DM Sans typography,
same "premium and controlled, not gaming" quality bar — the glow and motion budget goes up, but
Section 04's original warning against heavy glow/aggressive motion/saturated multi-color still
governs *how much*, not *whether*. When in doubt, a glow that reads as "considered engineering" is
right; one that reads as "esports peripheral" is too much. Validated in a working Claude Design
canvas mockup before being adopted here.

## Color

- **Background:** deep charcoal / near-black (`#0A0B0D`), not pure black — pure black causes OLED
  smear and reads harsher than intended.
- **Primary UI (text):** white / soft gray (`#F5F7F8` primary, `#9AA4AC` muted).
- **Accent:** emerald / electric green (`#10B981` fill, `#34D399` bright for icons/highlights).
  This is the one saturated color in the system — it should read as *the* signal color (CTAs,
  active states, the data-flow diagrams lighting up).
- **Secondary:** subtle blue/gray technical tones (`#94A3B8`) — used for the "system" feeling in
  diagrams and dashboard chips, never as a competing accent.
- **Futuristic complement:** electric cyan (`#22D3EE` fill, `#67E8F9` bright) — added alongside
  emerald for the futuristic direction above. Used for: the second stop in gradient-border/gradient-text
  treatments, the "material/labor/equipment" tier of nodes in the cause-and-effect diagram (keeping
  emerald reserved for the production source and the resolved/final node), and glow-blob backgrounds.
  Never used as a second competing CTA color — emerald stays the only accent on interactive controls.

**The one rule that's easy to get wrong:** the emerald accent as a *filled button background* needs
near-black text, not white — white-on-emerald fails WCAG AA (2.5:1). Emerald as text/icon color on
the dark background is fine either way. See `MASTER.md` for the full contrast table.

### Theme toggle (supersedes the original "dark-only" decision)

Dark is still the brand default, but a light theme is now available via the toggle in
`src/components/ThemeToggle.tsx` (fixed bottom-right, alongside the scroll-to-top button in
`FloatingControls.tsx`). All tokens are CSS custom properties on `:root`, overridden under
`:root[data-theme="light"]` in `globals.css` — every light-mode pair is independently
WCAG-contrast-checked (not just an inverted guess at the dark palette):

| Role | Dark | Light |
|---|---|---|
| Background | `#0A0B0D` | `#FAFAFA` |
| Foreground | `#F5F7F8` | `#0A0B0D` |
| Accent (text/ring) | `#10B981` (7.8:1) | `#047857` (5.25:1 — emerald-500 only hits 2.4:1 on white, too low for body text) |
| Accent-bright | `#34D399` | `#059669` |
| On-accent (text on filled accent bg) | near-black | white (inverted from dark mode — white-on-`#047857` passes at 5.5:1, unlike white-on-`#10B981`) |

The theme is applied via a `data-theme` attribute set by an inline script in `layout.tsx` *before*
first paint (reads `localStorage`, falls back to `prefers-color-scheme`, then to dark) — this
avoids a flash of the wrong theme while React hydrates. `ThemeToggle` reads/writes that attribute
through `useSyncExternalStore`, not `useState`+`useEffect`, specifically because the client's real
value is already known before hydration and a manual effect would force an unnecessary extra
render pass.

**One deliberate exception:** the Hero's content sits on a fixed-dark backdrop that itself does not
follow this toggle (see "Light theme: Hero, parallax, and the waitlist/footer scroll" below) — its
text is fixed dark-mode colors, not these tokens. Everywhere else on the page uses the tokens as
documented above.

## Typography

Space Grotesk (headings/display) + DM Sans (body) — a modern grotesk pairing that reads technical
without tipping into "coding terminal." Inter is the fallback if either font becomes unavailable
(same family feel; it's what Linear itself uses).

Base body size is 16px, line-height 1.5 — never go smaller for body copy, this is a trust-building
site for skeptical executives, not a dense dashboard.

**Implemented as real Tailwind tokens**, not ad hoc `text-3xl`/`text-4xl` per component — defined
under `--text-*` in `globals.css`'s `@theme inline` block, each paired with its own line-height:

| Class | Size | Use |
|---|---|---|
| `text-hero` | `clamp(2.75rem, …, 6rem)` | Section 01 headline only |
| `text-h1` | `clamp(2rem, …, 3.25rem)` | Section headlines (04, 05, 06, 09, …) |
| `text-h2` | `clamp(1.5rem, …, 2.125rem)` | Sub-headline emphasis (02's key message, 06's closing line) |
| `text-body-lg` | `1.125rem` | Lead paragraphs / subheadlines |
| `text-body` | `1rem` | Base body text |
| `text-label` | `0.8125rem` | Eyebrows, badges, data labels |

Reach for these classes before reaching for a raw `text-*xl` size — a new one-off size is a sign
the content probably fits an existing rung of the scale.

## Spacing & motion principles

Standard spacing scale (4px–96px, see `MASTER.md`) for the marketing sections. If Section 05's
real-product-UI mockups need to feel like an actual dense dashboard rather than a marketing
recreation, that's a legitimate reason to use a tighter, dashboard-specific scale *for that
component only* — don't loosen the rest of the page to match.

**The governing animation rule, verbatim from the spec:**

> Every animation must explain something (building separates → explains architecture; material
> decreases → explains inventory). No decorative-only motion.

Practical test before shipping any animation: can you state, in one sentence, what concept it
teaches the visitor? If not, cut it or redesign it. This applies to hover micro-interactions too,
not just the big scroll-driven scenes — a bento-grid card tilt on hover should feel like touching a
real interface, not like a game menu (spec explicitly calls out "premium + technical, not gaming
website" for Section 04).

Scroll-driven storytelling (Sections 01, 02, 03, 06, 07, 09) is scrubbed to scroll position, not
timed. Its exact choreography must be defined in `context/storyboard.md` *before* implementation —
see the storyboard gate in `CLAUDE.md`.

## Hero direction v2 (2026-08-30) — "mix A and C"

The user compared the homepage against Procore (`procore.com/en-sg`) and Fieldwire
(`fieldwire.com`) and called the original hero too empty/unconfident. Both competitor sites are
actually **light**, warm, photography-driven — the opposite of this site's dark/futuristic system —
so three comps were built (published as an artifact) at that fork: **A** dark-amplified (same
system, bigger/bolder composition), **B** full light Procore-style pivot, **C** dark hero cutting
into a light proof band via a diagonal seam. The user chose **"mix A and C"**: keep the dark/premium
differentiator (this remains the deliberate "not typical construction software" positioning), but
borrow C's structural device of a light closing band right after the hero.

What shipped, in `HeroSection.tsx` unless noted:

- **Site nav** (`src/components/Header.tsx`, mounted in `layout.tsx`): logo mark, `Platform` /
  `Product` / `Proof` anchor links, `Claim Early Access` CTA. The homepage had no persistent nav at
  all before this. **Positioned `fixed` (not `sticky`)** — `position:sticky` on this page
  intermittently failed to repaint once scrolled deep past the pinned scroll-scrubbed sections
  (confirmed via DOM/computed-style inspection: the element was always correctly positioned,
  z-indexed, and topmost on hit-testing, but didn't visually paint in automated screenshots at
  depth — a compositor quirk, most likely from the sheer number of simultaneous WebGL/ScrollTrigger
  layers on this page). `fixed` matches the already-working pattern in `FloatingControls.tsx` and
  resolved it. Every pinned/scroll-scrubbed section's inner sticky viewport
  (`HeroSection`, `ProductionEngineSection`, `CauseEffectSection`, `WaitlistSection`) was shifted
  from `top-0 h-screen` to `top-16 h-[calc(100vh-4rem)]` to clear the 64px header.
- **Hero composition amplified**: an eyebrow-style badge above the headline, a gradient
  (emerald→cyan) treatment on "Production-Centric" within the headline (copy itself is unchanged —
  still exactly "The Production-Centric Construction Engine."), and a secondary "See it in action"
  link next to the email capture, anchor-scrolling to Section 02. The 3D building illustration was
  **kept** (not swapped for an abstract dashboard panel as comp A's mockup showed) — it's a real,
  already-built asset explicitly reused in Section 09's reverse animation, and discarding it would
  have thrown away that requirement along with working engineering. The amplification comes from
  the surrounding composition, not from replacing the visual.
- **Fixed a real bug found while doing this**: the hero's 3D building rendered as a fully empty
  canvas at page-load (all materials default to `opacity: 0` in `createBuildingMaterials()`, and
  nothing set a visible at-rest state) — the wireframe blueprint only appeared once the visitor
  scrolled partway into the pinned section. `WaitlistSection` already had the correct pattern
  (explicit `gsap.set` calls for its own at-rest state); `HeroSection`'s scroll-scene builder now
  does the same, so the wireframe blueprint is visible immediately on load and solids fill in
  bottom-to-top as the visitor scrolls, matching the "starts as a blueprint" narrative in
  `context/storyboard.md`/section 01 spec instead of starting from nothing.
- **New light "audience band"** closing the hero: a diagonal seam (dark wedge over a light base,
  both explicit hex colors, not a reveal-the-page-background trick, so it works regardless of the
  visitor's light/dark theme toggle state) into three role cards — General Contractors, Owners,
  Subcontractors (subset of the Section 09 form's own `General Contractor / Subcontractor /
  Developer / Owner` taxonomy). **This uses deliberately fixed literal colors**
  (`#EDE7DA` / `#FFFFFF` / `#17150F` / `#635C4C` / `#B7511A`), not the `--background`/`--foreground`
  tokens, and does not follow the light/dark theme toggle — same category of scoped exception as
  Section 05's dashboard-specific spacing rule, just for color instead of spacing. It is *not* a new
  numbered section in `context/content-spec.md`'s page structure — it's the hero's closing beat,
  living inside `HeroSection.tsx`, before Section 02 begins (hard color cut back to dark, no seam
  needed there).

## Premium material pass (2026-08-30, same day as Hero direction v2)

After Hero direction v2 shipped, the user's reaction was "it all looks like a fucking PPT" —
the real complaint was layout, not palette: every section was a vertically-centered column
(eyebrow, headline, paragraph, CTA/visual) on a flat solid background, one "slide" at a time.
Two mockup rounds followed (published as artifacts, per [[feedback-show-mockups-before-code]]):
first a **layout fix** (asymmetry, overlap, bleed, one continuous surface instead of alternating
flat bands), then — after "make it premium" — a **material fix**, because the layout-fix mockup's
rotated/wobbly tag transforms actually read as *less* premium, not more. Precision turned out to
matter as much as richness. Both passes were then implemented across Hero, Production Engine (02),
Product Modules (04), Real Product UI (05), Trust (08), and Waitlist (09); Cause & Effect (03),
Business Outcomes (06), Comparison (07), and the Footer (10) were left untouched — they weren't in
either mockup, so per the same rule they get their own mockup-first pass before being touched.

**New shared tokens/classes (`globals.css`):**
- `--surface-2` / `--color-surface-2`: one step brighter than `--surface`, for panels that need to
  read as "raised" (proof card, founder block, waitlist card, browser-chrome mockups).
- `.panel-ring`: `box-shadow: 0 0 0 1px var(--color-border), 0 1px 0 rgba(255,255,255,.04) inset` —
  replaces flat `border border-border` wherever used in the touched sections. A box-shadow ring
  plus a hairline top inset highlight reads as a lit object; a flat 1px border reads as an outlined
  box. This is the single biggest lever in the "premium" pass.
- `.panel-raised` / `.panel-floating`: the same ring plus a `surface-2 → surface` gradient
  background, `.panel-floating` adding a large soft drop shadow for elements meant to visually
  float above the page (the hero proof card, the waitlist form card).
- Site-wide blueprint-grid + grain texture on `body::before`/`::after` (fixed, `z-index:-1`,
  `html` carries the actual background color so the transparent-bodied texture layers don't get
  painted over) — see the comment block above `.panel-ring` in `globals.css`. This is what makes
  the page read as one continuous surface rather than a stack of flat slide backgrounds; every
  section relies on it, none of them re-declare their own background texture.

**Hero (`HeroSection.tsx`):** the flat light "audience band" from direction v2 is gone — it was
exactly the flatness problem, just in a different palette. Replaced with a small dark floating
proof card (role tags + one line) that overlaps the hero/Section-02 seam via negative margin,
using `.panel-floating`. Added a low ambient glow-orb and a giant low-opacity outlined "MONO"
wordmark behind the headline for texture (both `pointer-events-none`, decorative only).

**Production Engine (`ProductionEngineSection.tsx`):** asymmetric two-column layout (room grid +
event tag left, cascading update chips + a large gradient-text pull-quote right) replacing the old
single centered column. Chips use a small fixed `marginTop` stagger, not `rotate()` — a rotated tag
was the layout-fix mockup's "wobble" that read as sloppy once put next to real premium execution;
margin-based stagger also avoids fighting the GSAP scroll-reveal, which drives `transform`
(`translate-y-2` as the hidden state) on the same elements — a transform-based stagger would have
been silently overwritten by the reveal's inline `transform`, so this isn't just a taste choice.

**Product Modules (`ProductModulesSection.tsx` / `BentoCard.tsx`):** one module (Cash Flow Engine)
renders as a featured, wider `<BentoCard featured>` spanning two grid columns with a
`surface-2 → surface` gradient background; the rest are equal-size cards in the remaining grid
cells. `BentoCard` gained a `featured` prop for this; its tilt/hover interaction is unchanged.

**Real Product UI (`RealProductUISection.tsx`):** the two dashboard panels are no longer flat cards
side-by-side — they're a local `BrowserChrome` component (real dim traffic-light-colored dots, a
title bar) rendered twice, absolutely positioned and overlapping with a CSS `perspective`/`rotateY`
tilt, Production Dashboard behind and slightly faded, Project Dashboard in front. The Cash Flow
Forecast chart keeps its own flat `.panel-raised` card below (a wide chart reads better flat than
tilted). All demo figures keep their `DemoDataBadge` — now one per panel, inside the browser-chrome
title bar, not just once at the section top — per `context/data-integrity.md`.

**Trust (`TrustSection.tsx`):** magazine split — a large `.panel-raised` "Founder & Team" block
(currently a honest "coming soon" card, **not** dressed up as a blockquote/cite — an early draft of
this did exactly that, which would have misrepresented a placeholder as a real founder quote; see
`context/data-integrity.md`) alongside a stack of four smaller cards (Engineering, Real Product,
Security, Customer Evidence) instead of five equal-width centered cards in a grid.

**Waitlist (`WaitlistSection.tsx`):** form fields and logic are untouched — only wrapped in a
`.panel-floating` card so it reads as floating over the dimmed building scene instead of sitting in
plain unstyled rows; tier cards and inputs switched from flat borders to `.panel-ring`.

**Header (`Header.tsx`):** switched from `position: sticky` to `position: fixed`. `sticky`
intermittently failed to repaint once scrolled past this page's pinned/scroll-scrubbed sections —
confirmed via DOM/computed-style inspection (always correctly positioned, `z-40`, opaque, topmost
on hit-testing) that this was a paint/compositor issue, not a logic bug, most likely from the sheer
number of simultaneous WebGL canvases and GSAP ScrollTrigger pins on this page. `fixed` matches the
already-reliable `FloatingControls.tsx` pattern and resolved it — this was direction v2's fix,
reconfirmed still necessary/working through the premium pass.

## Eyebrow: abstract, not numbered (2026-08-30)

The user flagged, from a screenshot of the live site, that every section eyebrow read like
"02 — Production Engine" / "07 — Comparison" — internal spec section numbers (from
`context/content-spec.md`'s page-structure table) that had leaked into visitor-facing copy. A real
visitor has no reason to know or care that this is "section 7"; it reads as an unfinished dev
artifact, not a design choice. Fixed by making `Eyebrow` abstract instead of numbered: a small
glowing accent dot (`h-1.5 w-1.5 rounded-full bg-accent-bright` + glow shadow) replaces the digit
prefix, and every call site now passes just the label ("Production Engine", "Comparison", ...) with
no number. The section `id` attributes in each component (`id="02-production-engine"`, etc.) are
unchanged — those are internal anchor targets, not visible copy, and `Header.tsx`'s nav links still
resolve correctly against them.

## Community components: liquid-text + parallax (2026-08-30)

User asked to integrate two 21st.dev community components: `liquid-text` (a blur-morph
cross-dissolve between words) and `parallax-scrolling`. Full source for the parallax one is
paywalled on 21st.dev — both its "CLI" and "Copy prompt" buttons hit a paid-plan gate, and the page
fetch only surfaces the demo/usage snippet, not `Component.tsx`. Rather than fabricate a component
and claim it's that one, this ships an equivalent effect built on the site's own already-integrated
GSAP + ScrollTrigger, documented below.

**`src/components/ui/liquid-text.tsx`** — adapted from the pasted source (@designali-in). Real
changes from the pasted version: `@ts-nocheck` removed (type-checks clean as-is once `React.FC`
patterns were swapped for the plain function-component style used elsewhere in this codebase);
the SVG filter id is scoped per instance via `useId()` (the original used a single hardcoded
`id="threshold"`, which would collide if the component is ever used twice on one page — it now is,
see below); default demo sizing (`40pt`–`6rem` display type) is stripped since every real usage
here is inline, not a hero-scale demo. Added `src/lib/utils.ts` (`cn` via `clsx` + `tailwind-merge`)
since the component depends on it and the project had no shadcn-style utils file yet.

Used once, in **Product Modules** (`ProductModulesSection.tsx`): a "Tracking ⟨morph⟩" line cycles
through the six real module titles already used as bento card headings below it. This was the
deliberate placement — the words being morphed are exactly the platform's own module names (no new
copy invented), so the motion itself demonstrates "one engine, many systems" rather than being
decoration bolted onto the line, per the governing animation rule. Rejected placements: the hero
subheadline (would have broken canonical copy — "every dollar, drawing, material, and worker" is a
fixed sentence, not a word-rotation slot) and any spot that would need invented marketing words.

**`src/lib/use-parallax.ts`** + **`src/components/ParallaxLayer.tsx`** — scroll-scrubbed
`yPercent` drift on decorative background elements (glow orbs, the hero's ghost wordmark), built on
plain `ScrollTrigger`, not a smooth-scroll library. The 21st.dev demo's own dependency list named
`@studio-freight/lenis`; that's deliberately not installed here — Lenis intercepts native scroll
globally, and this site's storyboard-gated animation (see `CLAUDE.md`) is built entirely on
native-scroll-driven `ScrollTrigger` timelines pinning full sections (Hero, 02, 03, 09). A global
smooth-scroll layer would fight the pin math on every one of those. A plain `ScrollTrigger` scrubbing
one element's own `transform` has no such conflict since it never touches how the page itself
scrolls.

Two integration patterns, for two different situations:
- **Normal-flow sections** (Real Product UI, Trust): `<ParallaxLayer speed={…} className=… style=…/>`
  drop-in, its own independent `ScrollTrigger` (`start: "top bottom", end: "bottom top"`). Safe here
  because nothing else in these sections is scroll-pinned.
  `ParallaxLayer` is a small client component specifically so the parent section files don't need
  `"use client"` — same reasoning as `Reveal`/`DemoDataBadge`/`AnimatedForecastChart`.
- **Hero** (pinned): the glow orb and ghost wordmark ride the *same* timeline instance that drives
  the building assembly (`tl.to(glowOrbRef.current, {...}, 0)`), not a second independent
  `ScrollTrigger`. Both elements live inside the `sticky` pinned viewport, which never itself
  translates during the pin — an independently-triggered `ScrollTrigger` targeting them would
  compute its start/end off a sticky element's already-stuck geometry, which is exactly the kind of
  thing that produces confusing results. Folding the drift into the existing timeline sidesteps it
  entirely.

## Orbital diagram replaces the 3D scene (2026-08-30)

User pointed at the production-chain diagram (the octagon-node Three.js scene) and asked to
replace it with the "radial-orbital-timeline" 21st.dev community component. That diagram was
reused identically across Sections 03, 06, and 07 per the "same visual object recurring"
requirement (context/sections/03-cause-effect.md), so this replaced it in all three, not just one —
leaving two of three still showing the disliked version would have broken that same requirement in
the other direction.

**`src/components/scenes/OrbitalDiagram.tsx`** — heavily adapted from the pasted source, not a
verbatim copy:
- Dropped the shadcn Badge/Button/Card imports it shipped with — they key off CSS tokens
  (`--primary`, `--card`, `--muted-foreground`, ...) this project never defines, so they'd render
  unstyled. Replaced with plain elements on this project's own tokens.
- Dropped "date"/"status" (COMPLETED/IN PROGRESS/PENDING) and the "Energy Level: N%" stat bar from
  the source demo — those are project-timeline concepts with a fabricated-looking percentage, and
  this isn't a timeline. Replaced with a tier badge (Source / Effect / Outcome) and a plain
  description, content mirroring the exact chip labels already established in Section 02
  (`ProductionEngineSection`: "Material −25 m³", "Labor +Production Hours", ...) rather than
  inventing new claims — see `src/lib/production-chain.ts`.
- `expandedId`/`onExpandedChange` make "which node is open" optionally controlled — `CauseEffectSection`
  drives it from scroll position; `BusinessOutcomesSection`/`ComparisonSection` leave it uncontrolled
  (click-only), since they're the static "same diagram, already resolved" recall placements, not
  the primary teaching moment.
- Auto-rotation and the ping rings are gated on `prefers-reduced-motion`; rotation also pauses
  whenever any node is open (controlled or not) rather than only on click, since a spinning orbit
  under a card the visitor is reading looks broken regardless of who opened it.
- Position math is rounded to whole pixels — full float precision produced a real server/client
  hydration mismatch (`"-85px"` vs `"-85.00000000000006px"`) since trig calls can differ in their
  last bit or two between the two environments; rounding makes both sides serialize identically.

**`CauseEffectSection.tsx` (03)** reinstates a scroll-scrubbed narrative — the old Three.js version
had one, and losing it when replacing the visual would have been a regression, not just a swap.
Rather than a GSAP timeline tweening numeric opacity (the old approach), a plain
`ScrollTrigger.create({ onUpdate })` maps scroll progress to a discrete node index, driving
`OrbitalDiagram`'s controlled `expandedId`. A click still works — it calls `onExpandedChange`
directly — and simply gets overridden by the next scroll tick; that's the intended trade (scrolling
tells the story, clicking lets a visitor who has paused scrolling linger on one node). Section 03
is normal-flow-pinned like before (`sticky top-16`), just `300vh` instead of `200vh` to give six
scroll-steps enough dwell time each.

**Sizing**: orbit radius 130→170px, center pulse 48→64px, container `max-w-md`→`max-w-xl` (03/06),
`max-w-sm`→`max-w-md` (07) — the previous size read as small/timid at this component's new visual
weight.

`DiagramScene3D.tsx` and `scene-config.ts` were deleted (confirmed nothing else referenced them)
rather than left as dead code.

## Orbital diagram, round 2: smoothness, sizing, stacking, pinning (2026-08-30)

Same-day follow-up after the initial swap, driven by direct feedback while watching it run:

- **Rotation smoothness.** The original port drove continuous rotation from a JS `setInterval`
  writing a new `transform` into React state ~20x/second, while the node wrapper also carried
  `transition-all duration-700` — the element was permanently mid-transition toward an
  already-stale target, which read as a visible stutter, not a spin. Replaced with a pure CSS
  `@keyframes orbit-spin` (globals.css) on the whole ring: each node's *position* is a static
  per-index angle (`rotate(baseAngle) → translateX(radius)`), and the ring's `animate-orbit-spin`
  class does the only actual motion, paused (not stopped — `animation-play-state`, freezes
  mid-rotation) whenever a node is open. Each node's content runs the identical keyframe in
  reverse (`animate-orbit-counter-spin`) plus a static `rotate(-baseAngle)` counter, so icons/
  labels stay upright rather than tumbling — see the file's own comments for the transform-
  composition reasoning (translateX and a counter-rotate can't be combined in one `transform`
  string on one element; CSS composes multi-function transforms into a single matrix, not a
  sequence of independent frames, so they need to be separate nested elements).
- **Container-relative sizing.** Radius/center-orb/orbit-ring were fixed pixel values, fine in
  Section 03's max-w-xl container but overflowing Section 07's narrower max-w-md one — a node's
  label/card collided with its neighbor. Fixed by putting `@container` (Tailwind's
  `container-type: inline-size` utility) on the diagram root and sizing everything in `cqw`
  (container query width) instead of px — `ORBIT_CQW = 35`, one number now controls the orbit at
  every placement's size. The card width still needed an explicit `clamp(11rem, 58cqw, 15rem)` cap
  (a naive 100%-cqw card would itself grow with the container and start colliding again at some
  sizes).
- **Center orb rendering over an open card's text.** Not a sizing bug — a stacking-context bug.
  The center pulse orb has an explicit `z-10`; the rotating ring has an *animated* `transform`,
  which itself creates a new stacking context, so the expanded card's `zIndex: 200` (set deep
  inside that ring) only ever wins comparisons against siblings *inside the ring's own context* —
  against the orb (a sibling of the ring itself, one level up), what matters is the ring's own
  z-index, which was unset (`auto`). Fixed with one `z-20` on the ring container. This class of bug
  (an inner z-index that "does nothing" against an outer sibling) is worth remembering: it always
  means something in between silently started its own stacking context.
- **Card redesign** — tier-colored accent bar, a CSS-only diamond pointer connecting the card back
  to its node (two divs: a rotated square plus a matching top/left border-color trick, no image),
  gradient panel background, refined type scale. Pure CSS, no new dependency.
- **Sections 06 and 07 are now pinned**, matching 03's `h-[300vh]` / `sticky top-16` treatment —
  this reverses the original "06/07 are static, already-resolved recall placements" framing from
  the initial swap. `useOrbitalScrollStep` (`src/lib/use-orbital-scroll-step.ts`) is shared across
  all three; 03/06/07 all pass `start:"top top", end:"bottom bottom"` now (the hook's own default,
  `"top 75%"/"bottom 25%"`, is no longer used by any current placement, but stays as the
  appropriate default for a future non-pinned placement). The hook also now resets `expandedId` to
  `null` on `onLeave`/`onLeaveBack` — outside its own scroll window a diagram should idle-orbit, not
  sit frozen on whichever node it last landed on.
- **Comparison's legacy-system cards** get a staggered entrance (`animate-legacy-scatter-in`,
  globals.css) — each drifts in from an exaggerated version of its own resting tilt. This is meant
  to read as what "disconnected systems" looks like, staged right next to the orbital diagram's one
  connected chain on the other side of the same pinned section — motion explaining the claim, not
  decorating it, per the governing animation rule. The closing line ("Separate systems, no shared
  source of truth.") is now bold and lands last in that same stagger, as the section's thesis
  statement rather than another supporting line.

## Orbital diagram, round 3: compact cards, dimming, an explicit interaction hint (2026-08-30)

The round-2 sizing fix (container-relative `cqw` radius) stopped literal overflow but didn't leave
enough clearance for six nodes 60° apart plus an expanded card — at that spacing a card roughly as
wide as the inter-node distance will always brush a neighbor geometrically, no radius tweak alone
fixes that. Two changes, used together:
- **Card is genuinely smaller** — width clamp down to `clamp(8.5rem, 42cqw, 10.5rem)` (was
  `11–15rem`), tighter padding/type/gaps throughout.
- **Everything not part of the open node's story dims** (`isDimmed`: not expanded, not related —
  opacity down to .25 with a hair of blur) whenever any node is open. This is what makes the open
  card actually read as *elevated above* the ring instead of *colliding with* it — geometrically the
  card can still be close to a neighbor, but a dimmed neighbor behind a bright card reads as
  intentional layering, not a bug. Cheaper and more robust than trying to portal the card outside
  the rotating transform chain to compute a collision-free position (the rotation is pure-CSS now,
  precisely so JS wouldn't need to know live angles — reintroducing that just to dodge overlap would
  have undone the round-2 smoothness fix's whole premise).

**Interaction hint is now a visible affordance, not a sentence.** Section 03's "scroll to trace it,
or click a node directly" used to be the second half of the same descriptive paragraph — easy to
skim past as filler copy. It's now a separate pill (`MousePointerClick` icon, accent color,
`panel-ring`) below the description, visually announcing "this is interactive" rather than
describing it in prose a visitor has no reason to read closely.

## Orbital diagram, round 4: docked card, leader line (2026-08-31)

Round 3's dimming made an overlapping card *read* intentional but didn't stop the geometric overlap
itself — user testing (screenshots) still found an expanded card's text running into a neighboring
node's icon/label at certain rotation angles, and the density of six 60°-apart nodes meant any
card that opens *beside its own node* is fighting for the same limited space no matter how smart
the up/down/left/right placement heuristic is. Two intermediate approaches were tried and rejected
before landing here:
- Per-node diagonal quadrant popout (card floats up/left/up-right/etc. based on which neighbor is
  closest) — fixed the specific reported overlap but still let the card's position vary
  unpredictably per click, which read as "the card is glitching around" rather than deliberate.
- A version of the above with a longer diagonal leader line — same underlying problem, just with
  more travel distance before the collision could occur.

**The actual fix: the card never moves.** It lives in one fixed dock (`right-0`, vertically
centered, `w-[clamp(11.5rem,34cqw,15rem)]`) to the right of the ring; only a glowing SVG leader
line changes, redrawn from the just-clicked node's real on-screen position to the dock's edge.
Because the dock is the *only* thing ever in that spot, there is no neighbor for it to collide
with — the round-3 dimming is now cosmetic reinforcement (still helps parse "which nodes are the
open one's story"), not the primary anti-collision mechanism.

To make room for the dock without widening every section's container, the ring's own center moved
off literal 50% to `RING_CENTER_LEFT = 36%`, freeing a strip on the right. The leader line is an
`<svg><line></svg>` overlay sized to the container, not a rotated/positioned `<div>` — its two
endpoints are plain measured DOM coordinates (`getBoundingClientRect` on the active node and the
dock, in the same `useEffect` keyed on `expandedId` that round 2 established for reading real
rotation state), so the browser draws the segment directly instead of this code hand-computing an
angle and length. The card itself is always mounted (not conditionally rendered) and cross-fades
via `opacity`/`scale`/`translate-x` on an `expandedNode` check, so switching nodes reads as content
swapping in one place rather than a new element popping in a new place each time.

Design was mocked up as a standalone artifact (before/after of the reported bug, plus a clickable
six-node demo of the docked-card mechanism) and approved before touching `OrbitalDiagram.tsx` —
see `feedback_show_mockups_before_code` in the assistant's session memory for why that's now
standing practice for this project.

## Orbital diagram, round 5: transform-origin bug, dock clearance (2026-08-31)

Screenshot report: nodes visibly floating off the ring line ("orbital detached from the icons"),
and the docked card overlapping the ring/node instead of sitting clearly beside it. This one was a
straight bug fix on already-approved geometry, not a redesign, so it skipped the mockup step round
4 established — verified directly against the running dev server (see below) instead.

**Root cause of the detachment: the spinning layer's rotation pivot didn't match the ring's own
center.** The continuously-rotating wrapper (`animate-orbit-spin`, `z-20`) is an `inset-0` box, so
its default `transform-origin` is *its own* center — the container's literal 50%, not
`RING_CENTER_LEFT` (36% at the time). Rotating a set of nodes around the wrong pivot is only
invisible at `rotate(0)`; at any other paused angle (i.e. almost always, since the animation pauses
on whatever angle it happened to be at when a node was clicked) every node traces a circle around
the wrong point and drifts off the separately-rendered, non-rotating ring by an amount that grows
with how far the pause angle is from 0°. Fixed by setting `transformOrigin: '${RING_CENTER_LEFT}
50%'` explicitly on that layer so its rotation pivot always matches the ring's actual center,
whatever `RING_CENTER_LEFT` is set to.

**Dock clearance:** with nodes correctly on the ring at all angles, the ring's rightmost reach
(`RING_CENTER_LEFT + ORBIT_CQW`, plus each node's own radius) measured out to overlapping the
docked card's left edge by 60+px at Section 03's container size — confirmed with
`getBoundingClientRect()` in a live tab, not eyeballed. Rather than one large change, the fix
splits a smaller reduction across three numbers so no single element changes drastically: `
ORBIT_CQW` 35 → 26, `RING_CENTER_LEFT` 36% → 34%, dock width clamp `(11.5rem,34cqw,15rem)` →
`(10rem,29cqw,14rem)`. Verified with the dev server across all three placements (Section 03's
`max-w-2xl`, Section 06/07's narrower `max-w-lg`) — nodes stay attached to the ring at every
rotation angle, and the dock now sits with a clear, deliberate gap off the ring instead of cutting
into it.

## Orbital diagram, round 6: straight leader line, more room on the tightest placement (2026-08-31)

Follow-up screenshot report on round 5's fix: the leader line still read as a harsh straight
diagonal, and at some rotation angles it visibly grazed a neighboring node's icon on its way to the
dock ("its on the logo") — worst on Section 07's narrower `max-w-lg` placement, which round 5 had
already identified as the tightest of the three but hadn't given extra room beyond the shared fix.

**Straight-line node graze, explained:** the leader line's endpoints are the active node's center
and the dock's edge — a straight chord between them frequently cuts back across the ring's own
interior, which is exactly where the *other* five nodes live. Round 5 fixed nodes drifting off the
ring; it didn't change the fact that a straight line from one ring point to a point outside the ring
can still pass close to a third ring point in between.

**Fix: the line is now a quadratic Bézier bowed away from the ring's center**, not a straight
`<line>`. The control point is the chord's midpoint pushed outward, perpendicular to the chord,
in whichever of the two perpendicular directions actually points away from `RING_CENTER_LEFT` (a
sign check against the midpoint-to-center vector — the other direction would bow the curve back
*into* the ring, making the graze worse). Bow distance scales with chord length (`22%`, clamped to
20–56px) so short hops curve gently and long diagonal ones curve enough to actually clear a node in
between. This routes the line around the ring's interior instead of through it, and reads as a
deliberate flowing connector rather than a technical debug line.

**Second follow-up, same round: the line's start point was still the node's *center*.** The curve
fix above stopped it from grazing *other* nodes, but a center-anchored start still drew a visible
stroke straight across the active node's *own* icon glyph before the line ever left the circle
("the extra line in the icon" — screenshot showed a stray stroke cutting through the Schedule
node's calendar icon). Fixed by offsetting the start point by the node's own radius along the
center-to-dock direction, so the visible line begins exactly on the circle's rim ("drawn from the
outside wall") pointed toward the dock, never crossing the icon inside it.

**More room on Section 07 specifically:** re-derived the shared geometry against the *narrowest*
container instead of Section 03's — the dock's width clamp hits its `10rem` floor at `max-w-lg`,
which means it claims a *larger share* of that smaller container than it does at `max-w-2xl`, so
the round-5 numbers left Section 07 with only ~11px of gap versus Section 03's ~37px. `ORBIT_CQW`
26 → 23, `RING_CENTER_LEFT` 34% → 32% (dock clamp unchanged). Section 07's gap grows to ~42px;
Section 03's grows too (~37px → ~78px) as a side effect of sizing for the tighter case, which reads
as generous rather than empty at that container's larger scale.

## Orbital diagram, round 7: long labels wrap instead of overflowing (2026-08-31)

Screenshot at a wide (1920px) viewport caught "Cash Flow → Forecast" — the longest node label, ~21
characters — peeking out from *underneath* the docked card in Section 07: `whitespace-nowrap`
rendered it as one ~150px-wide line, wide enough that it reached past its own icon and under the
dock's opaque background at some rotation angles, none of the round 5/6 gap math had accounted for
(that math sized against the icon's own radius, never the label text beneath it). Short one-word
labels ("Material", "Labor") never approached this width, so it only ever showed up on the one
three-word label. Fixed by capping the label to `max-w-24` (removing `whitespace-nowrap`) so it
wraps to two lines instead of extending horizontally — roughly halves its footprint, which a
generous-enough margin comfortably clears without any further geometry changes.

## Comparison section (07): known asymmetry, not fixed (2026-08-31)

Follow-up UI/UX pass flagged the two-column grid (`LEGACY MODEL` list vs. the `OrbitalDiagram`) as
visually "not aligned." Both column headings genuinely start at the same y (verified against a live
tab) — what reads as misaligned is that the legacy list's content is heaviest right at the top,
while the diagram's content is heaviest at its box's vertical *center* (`top-1/2` inside a tall
`aspect-square` box), so the two columns' visual weight doesn't land at the same height even though
their top edges match. Deliberately left as-is rather than patched: vertically centering only the
legacy column would misalign the headings (the one thing that *is* currently correct), and shifting
the ring's anchor inside `OrbitalDiagram` would touch the shared component all three placements
depend on for a purely cosmetic call. Flagged here for a deliberate design decision, not silently
dropped.

## UX/accessibility pass via `ui-ux-pro-max` (2026-08-31)

Ran the skill's pre-delivery checklist (§1 Accessibility, §2 Interaction, §8 Forms) against the real
code rather than the visuals. The baseline held up well — `focus-visible` rings, `aria-label`s on
every icon-only control, `aria-hidden` on decorative SVG, labelled form fields, a `useReducedMotion`
hook wired through every animated component. Four genuine defects, all fixed:

- **The Hero's email capture did nothing.** It was `onSubmit={(e) => e.preventDefault()}` and
  nothing else — a visitor could type an address, press the page's primary CTA, and get no response
  of any kind. There's still no backend (`context/tech-notes.md`), but "no backend yet" and "the
  button looks broken" are different problems: it now confirms and points at the waitlist section.
- **Both submit confirmations were silent to screen readers.** Each replaces its form with a
  success `<p>`; since the form unmounts, nothing was announced. Both now carry
  `role="status"` + `aria-live="polite"`.
- **Heading outline skipped h1 → h3** in Sections 03, 07 and 08 (03 had no heading element at all —
  its lead line is a `<p>`). Each got an `sr-only` `<h2>`: the Eyebrow already communicates the
  section to sighted visitors, so adding a *visible* second title would be redundant — this fixes
  the outline and heading navigation while changing nothing on screen.
- **No `autoComplete` / `inputMode` on any field**, so browsers couldn't autofill and mobile
  keyboards came up wrong. Added across both forms, plus `cursor-pointer` on the selects.

**On the skill's auto-generated design system:** re-running `--design-system` for this brief again
returned an off-brief palette (light `#F8FAFC` ground, red `#DC2626` accent, Inter for both roles) —
the same failure mode `CLAUDE.md` already warns about, and it was discarded again. What *was* useful
is the style match it confirmed ("Modern Dark": layered glass, ambient light, avoid pure `#000000`)
and its motion spec — `cubic-bezier(0.16,1,0.3,1)`, ~220ms, press-scale 0.97 — which is what the
proposed retouch below is built on. Treat the generator as a source of *effects and validation*, not
of colour or type, for this project.

## Surface & motion pass (2026-08-31)

Mocked up as an artifact first (per `feedback_show_mockups_before_code`) with each proposal live
beside the current treatment — most of it is hover/press behaviour, which doesn't read in a static
image — then approved as a set and shipped. Five changes; palette, typefaces, copy and layout
positions all unchanged.

**Two shared primitives, in `globals.css`,** so this stays a system rather than five one-offs — the
skill's `elevation-consistent` rule is the reason these are classes and not per-component
box-shadow strings:
- `--ease-expo: cubic-bezier(0.16,1,0.3,1)` — the easing the `ui-ux-pro-max` "Modern Dark" style
  entry specifies for this direction. Theme-independent, so it isn't duplicated in the light block.
- `.press-feedback` (220ms, `scale(0.97)` on `:active`) and `.card-lift` (`translateY(-3px)` +
  `--color-surface-2` + an emerald-tinted ring). Both no-op their transform under
  `prefers-reduced-motion`.

1. **Buttons answer back.** `ui/Button.tsx` and the header CTA previously animated a hover recolour
   and had *no press state at all*. They now carry `.press-feedback`; `hover:brightness-105` rather
   than a second background utility, so callers passing their own gradient still get a hover.
2. **Cards register the cursor.** Trust proof cards and Waitlist tier cards were completely inert —
   nothing signalled they were considered surfaces. Both now carry `.card-lift`. `BentoCard` keeps
   its own richer tilt (it's the featured grid) rather than being flattened into the shared one.
3. **The wide module card stopped floating.** `BentoCard` used `justify-between`; with
   `grid-auto-rows:1fr` every card is the same height, so on the `col-span-2` card — whose copy
   wraps to fewer lines — that gap opened up and stranded its title against the bottom edge while
   every narrow sibling read as top-aligned. Now `justify-start`, with an optional `footer` prop
   taking the freed space on the wide card only.
4. **Founder card earns its height.** It was `justify-end` on a 21rem minimum, roughly four-fifths
   empty, while the column beside it ran past its bottom edge. Now top-aligned with a 2×2 fact grid
   pinned to the bottom via `mt-auto`. **Every fact restates something this site already says** —
   the relational-model line from the Engineering card, the encryption line from Security, the
   early-design-partner tier from Section 09 — and deliberately none of them is a metric. See
   `context/data-integrity.md`; the honest "coming soon" copy is untouched.
5. **Footer reads as a company.** One wrapping row of links became a three-column group (brand +
   tagline / Platform / Company) over a ruled copyright line. Same links, same pending states,
   same `aria-disabled` treatment on the ones that don't have destinations yet.

## One waitlist, two entry points — and why the anchors didn't work (2026-08-31)

User report: "clicking on the claim early access is not going top… there is also a join waitlist,
so that input should come to this footer waitlist so that we can take more details… why there is
two?" Two separate problems, and the second one is the more important of the pair.

**Why the CTA did nothing.** The header CTA pointed at `#hero-email` — an `<input>` *inside* the
Hero's `position: sticky` scroll-scrubbed subtree. Verified in a live tab that the anchor itself is
fine (nothing overlays it; dispatching a click sets the hash and its default isn't prevented), so
the failure is the scroll, and the target is why: an element inside a sticky child has a document
position that *changes as the page scrolls toward it*. The browser resolves a target from the
current layout, scrolls, the sticky child re-pins, and the element is no longer where the scroll was
aimed. It was also a target that unmounted once the Hero form was submitted, leaving a dead link.
On top of that, the global `scroll-behavior: smooth` animates a 13,000px jump frame-by-frame through
six scrubbed GSAP timelines and two WebGL scenes — heavy enough that it froze the renderer outright
during testing.

Fixed with `src/lib/scroll-to-section.ts`: resolve the *section wrapper's* top (whose offset does
not depend on scroll position), subtract the 64px fixed header, and jump with `behavior: "auto"`.
Applied to the CTA and all three primary nav links, which had the same 5,000–13,000px problem.

**Why there were two forms.** The Hero and Section 09 each owned an unrelated email capture, and the
Hero's had no handler at all — so a visitor could "sign up" at the top, be in no list whatsoever,
then be asked for the same address again further down. The Hero input is now the *first field of
Section 09's form* rather than a competitor: submitting it carries the address into that form via a
small context (`src/lib/waitlist-handoff.tsx`), scrolls there, and focuses `company-type` — the
first thing still unanswered, since re-typing the address they just gave is exactly what the handoff
exists to avoid. Section 09 stays the single place a signup completes, which is where the qualifying
detail (company type, project volume, active projects) is collected.

Deliberately *not* a query param or `sessionStorage`: the handoff only has to survive a scroll within
one page view, and a query param would put a business email in the address bar and browser history.
The prefill is applied by adjusting state during render (React's documented pattern for deriving
from a changed input) rather than in an effect, which would render once with the stale value.

Verified live: the address lands in Section 09's field and focus moves to `company-type`. **The
scroll motion itself could not be verified** — programmatic scrolling is blocked inside the
automation tab (wheel scrolling works, `window.scrollTo` is refused), so all four targets were
checked to resolve to sane in-range offsets instead. Worth a manual click-through to confirm.

## Animated dropdown on the waitlist selects (2026-08-31)

User request: put Shatlyk1011's "Animated Dropdown" (21st.dev / emerald-ui) on the form's dropdowns.
Its source isn't publicly readable (the code tab is gated and the repo API is rate-limited), so it
was rebuilt from the documented behaviour and preview — the same route the Horizon Hero took, and
the same "borrow the technique, not the palette" rule as every other community component here.
`src/components/ui/AnimatedSelect.tsx`; both Section 09 `<select>`s now use it.

Behaviour matches the original: trigger showing the current selection, menu that expands/collapses
smoothly with its items staggering in (28ms apart), chevron that flips, click-outside to dismiss.
Two deliberate departures:

- **No framer-motion.** The original animates with it. This site has no such dependency and
  standardises on GSAP for scroll work plus CSS for state transitions — and design.md already
  records the lesson about JS-driven animation jank. The whole effect is an opacity/transform
  transition with a per-item delay, so it reuses `--ease-expo`, the token `.press-feedback` and
  `.card-lift` already share. Adding a second animation runtime for one dropdown wasn't worth it.
- **Built as a real listbox.** This replaces a native `<select>`, which supplied keyboard support,
  a mobile picker, autofill and screen-reader semantics for free — the exact things the a11y pass
  above had just finished fixing, so dropping them silently wasn't acceptable. Re-implemented to
  the APG select-only combobox pattern: `role="combobox"`/`listbox`/`option`, `aria-expanded`,
  `aria-activedescendant`, arrows, Home/End, Enter/Space, Escape, Tab, and type-ahead; focus
  returns to the trigger on commit; a hidden input keeps the value in the form's data and reachable
  by autofill. The menu closes via `visibility` rather than unmount so it can animate out while
  still leaving the accessibility tree when closed.

Verified live: mouse select and keyboard (↓ ↓ Enter) both commit, close, restore focus, and update
the hidden input. **Worth knowing:** a custom control still can't fully match a native `<select>` on
mobile, where the OS wheel picker is genuinely better than any web menu. If that matters more than
the animation on small screens, rendering the native element under a breakpoint is a small change.

## Scroll progress bar across the top (2026-08-31)

`src/components/ScrollProgress.tsx`: a 3px emerald→cyan line pinned to the top of the viewport
(`z-50`, above the header) that fills left to right with scroll progress — the treatment the user
referenced from another site.

It animates `transform: scaleX` on an already-composited element rather than `width`, which would
force layout every frame, and scroll reads are rAF-coalesced — this runs against six scroll-scrubbed
GSAP timelines and two WebGL scenes, so it must not add work per scroll event. `aria-hidden`: it
reports scroll position, which assistive tech already conveys, and it isn't operable.

**Native scrollbars are hidden site-wide** so this bar is the only scroll indicator — a second one
down the right edge is the duplication it exists to replace. Hiding them takes three declarations,
because no single one covers every engine, applied to `*` rather than just `html` so nested scroll
areas (e.g. `AnimatedSelect`'s option list) match the page instead of showing an OS bar of their own:

| Declaration | Covers |
|---|---|
| `scrollbar-width: none` | Firefox (the standard property) |
| `-ms-overflow-style: none` | legacy Edge / IE |
| `*::-webkit-scrollbar { display: none }` | Chrome, Safari, Edge, Opera — every WebKit/Blink browser, on macOS, Windows, Linux, iOS, Android |

Scrolling itself is untouched: wheel, trackpad, touch, keyboard and Page/Home/End all behave as
before. The one real cost, accepted deliberately: there's no thumb left to drag. Note also that the
page gains ~15px of width on platforms that reserved space for a classic scrollbar.

**Build note, so this isn't re-litigated:** the first attempt put the indicator on the *right edge*
as a vertical rail styled like a scrollbar. That was a misreading — the ask was the top treatment
all along. That rail is deleted; `ScrollProgress.tsx` is the only scroll indicator.

**The bar writes to the DOM node directly, not through React state.** It updates on every animation
frame while scrolling; a `setState` per frame queues a React render per frame on a page already
running six scroll-scrubbed GSAP timelines and two WebGL scenes. It holds a ref and assigns
`style.transform` in the rAF callback instead, so scrolling triggers no React work at all. The first
version used state — if scroll ever feels like it stutters, check that this hasn't regressed.

## Section 09 overflowed its pinned box (2026-08-31)

Reported as "waitlist is broken". Measured rather than guessed: the sticky box gives 799px of usable
height and the content (heading 157 + form 472 + tier cards 184 + gaps) came to 893px — **a 94px
overflow**, which `justify-center` splits evenly, pushing the heading up behind the fixed header and
cutting the tier cards off the bottom.

This is the **same failure as Sections 03 and 06**, which were fixed earlier in the day by capping
the orbital diagram against viewport height. Section 09 has no single dominant element to cap, so it
was missed — worth remembering that *every* `h-[calc(100vh-4rem)]` + `justify-center` pinned section
carries this bug, and the fix is per-section.

Fixed by trimming the stack (`py-16`→`py-8`, `gap-10`→`gap-6`, form card `p-8`→`p-6`, tier cards
`p-5`→`p-4`) to 837px against 863px available — **26px of headroom**, so it fits down to roughly a
965px-tall viewport. Below that, `[justify-content:safe_center]` is the guard: `safe` falls back to
flex-start when content would overflow, so it can only spill *downward* into the section's own
scroll room, never upward underneath the header — which is the half that actually reads as broken.
Consider `safe center` for the other pinned sections too if they're ever reported.

## Hero: horizon scene replaces the 3D building (2026-08-31)

`BuildingScene3D` (Three.js) is gone from the Hero specifically — replaced by `HorizonScene.tsx`, a
pure CSS/SVG starfield + mountain-ridge silhouette + horizon glow, inspired by 21st.dev's "Horizon
Hero Section" (full source paywalled; built from its visible preview + dependency list, palette
swapped to this site's own emerald/cyan tokens rather than the reference's blue/red — same
"borrow the technique, not the palette" rule as the orbital diagram and other community-component
adaptations). `BuildingScene3D` itself is **not** deleted — the Waitlist section still uses it for
its floor-by-floor "reversal" animation, which is a different narrative beat (the building coming
apart, mirroring the Hero's build-up) that the horizon scene doesn't serve.

Reasoning locked in via user decision: CSS/SVG over a second Three.js scene, specifically because
this session spent significant effort eliminating JS-driven animation jank elsewhere (the orbital
diagram's rotation) — reintroducing WebGL for what's ultimately page decoration works against that
lesson. The three layers (stars slowest, mountain mid, glow fastest) parallax by riding the Hero's
*existing* `useScrollScene` timeline rather than an independent `ScrollTrigger`, for the same reason
established with the old building parallax: a `sticky`-pinned viewport never itself translates
during the pin, so a separately-triggered `ScrollTrigger` targeting an element inside it computes
its start/end off already-stuck geometry. Star placement uses pure integer arithmetic
(`(i * 37) % 68`, no `Math.random()`/`Math.sin()`) — this session hit two separate server/client
hydration mismatches from float-precision differences in trig-based positioning (see the orbital
diagram's `baseAngle` rounding), so the starfield was built to have no such ambiguity at all.

## Waitlist & Footer: shared grid-glow, honest placeholder links (2026-08-31)

Both sections now carry the same quiet background treatment — `GridGlow.tsx`, a faint blueprint
grid (`.bg-blueprint-grid`, factored out of `body::before` into a reusable class since a
pseudo-element can't be given a class) plus a soft radial glow, giving the page's top and bottom
the same visual language without duplicating the CSS. The Waitlist heading gets the same
gradient-text treatment already used on "Production-Centric" in the Hero (`from-accent-bright
to-cyan`), for consistency rather than inventing a second gradient. Per explicit user decision, the
avatar-stack / "N people on the waitlist" counter pattern from the reference component was **not**
added — it would be exactly the kind of fabricated scarcity/social-proof number
`context/data-integrity.md` already blocks for "340+ companies," just in a different section.

Footer now carries LinkedIn/X icons and a Privacy Policy link (previously omitted entirely — no
real destinations existed). Per user instruction ("include demo, we'll have all [the real links]
later"), these ship now but stay honestly non-functional rather than pointing at fabricated
external URLs that would 404: `href="#10-footer"` (an inert self-link, not a fake domain),
`aria-disabled`, a `title="… — coming soon"`, and reduced-opacity/italic-dashed styling matching
`TrustSection.tsx`'s existing `pending` card convention. Swapping in real URLs later is a one-line
change per link with no other markup to touch. lucide-react no longer ships brand/logo icons, so
the LinkedIn/X glyphs are small inline SVGs rather than pulling in a second icon package for two
symbols.

## Component patterns specific to this site

- **Bento module grid (Section 04):** subtle 3D tilt on hover, elevation + emerald/cyan
  gradient-border glow on active/selected. Feel: premium + technical + controlled, now with more
  visual energy than the original restrained version — still avoid anything that reads as a
  gaming UI (saturated multi-color, jittery motion); a soft, considered glow is on-brand, a
  neon flicker is not.
- **Production-chain / data-flow diagrams (Sections 03, 06, 07):** the conceptual centerpiece of
  the whole site — treat it with more design care than any individual feature card. A visitor
  should be able to redraw it from memory after seeing it. Nodes light up in sequence to show
  cause → effect; this is the single most important animation on the page. **Now a live Three.js/
  WebGL scene** (glowing nodes, particles animating along the connecting edges, gentle auto-sway)
  rather than a static SVG — see `context/tech-notes.md` → "3D pipeline" for the implementation
  decision and rationale. The same node positions/shapes (and now the same scene-builder
  component) are reused across 03, 06, and the right-hand side of 07, per the original
  "same visual object recurring" requirement — that requirement is *easier* to honor now since
  it's literally the same component instantiated with different labels, not a visual approximation.
- **Hero and Waitlist building (Sections 01, 09):** also now a live Three.js scene — an isometric
  (`OrthographicCamera`) stack of floor slabs going from wireframe/blueprint at the bottom to solid
  emissive-glow at the top, auto-rotating when idle and drag-to-orbit on pointer interaction. Section
  09 reuses the same scene component as the hero, per the spec's "reverses the hero animation...
  reuse the same 3D building asset" requirement.
- **Real product dashboards (Section 05):** this is the pivot from marketing visualization to
  actual software — it should look *less* stylized than the rest of the page, not more. Any demo
  figures ($12.8M, 67%, 58.3 m²/man-day, etc.) must carry a visible "demo data" label — see
  `context/data-integrity.md`.
- **Comparison diagram (Section 07):** fragmentation-vs-unification visual contrast, not a
  checkmark table. Legacy model shown as disconnected silos; Mono CM shown as the same production
  chain from Section 03.

## Light theme: Hero, parallax, and the waitlist/footer scroll (2026-09-01)

User report covered three things together: "the parallax effects needs to be worked on," "make it
look good in the light mood," and a scroll effect under the waitlist form, on the way to the
footer, that did nothing visible and should be removed. Investigated live in both themes (dev
server + browser) rather than guessed at — three real, connected bugs, not one:

**1. Hero was unreadable in light mode.** `HorizonScene.tsx`'s sky gradient is a fixed
`#0a0b0d → #0c131a → #0a0b0d` — deliberately a night sky (see "Hero: horizon scene replaces the 3D
building" above), and it does not switch with the theme toggle. But the headline, subheadline, and
"See it in action" link used the theme-aware `text-foreground`/`text-foreground-muted` tokens,
which flip to near-black in light mode — confirmed live, the headline was almost invisible against
its own backdrop. Fixed by locking those elements (plus the eyebrow badge, which had the same
problem with `--accent-bright`) to fixed dark-mode colors (`#F5F7F8`/`#9AA4AC`/`#34D399`) instead of
the tokens — the same "always dark, scoped exception" pattern already established for this
section's former audience-band cards and Section 05's dashboard spacing. Everything *outside* the
horizon scene (the floating proof card below the Hero, the header, every other section) already
used the tokens correctly and adapts normally; the fix is scoped to just the content sitting on top
of the fixed-dark backdrop. The email input and CTA button were already fine — `bg-surface`/
`text-on-accent` on a filled control read correctly regardless of what's behind it.

**2. The decorative parallax glow orbs were nearly invisible in light mode**, which is most of what
"parallax needs work" turned out to mean. `TrustSection.tsx` and `RealProductUISection.tsx`'s
`ParallaxLayer` blobs used a low-alpha rgba (`0.10`) tuned to read as a soft haze against near-black
— on `#FAFAFA` the same blur was confirmed live to be essentially indistinguishable from the page,
so the parallax motion behind it was technically running but nothing was visibly there to move. New
shared tokens in `globals.css`, `--glow-emerald`/`--glow-cyan` (full radial-gradient strings, not
just a color), fix this properly instead of just nudging one number: dark keeps roughly the
original soft-haze values, light uses a darker, more saturated stop at roughly 2–3× the alpha, since
a light background needs more pigment to read the same visual weight at the same blur radius.
`GridGlow.tsx` (Waitlist/Footer's shared background glow) now also uses `--glow-emerald` instead of
its own hardcoded rgba, for the same reason and for consistency. Existing orb speeds were also
bumped slightly (0.15→0.25, 0.18→0.28) within the documented 0.1–0.3 range, and the redundant
`opacity-60`/`opacity-70` wrapper classes were dropped since the alpha now lives correctly in the
gradient itself instead of compounding through two multipliers.

**3. Waitlist's pinned scroll animation into the footer was dead scroll.** `WaitlistSection.tsx` was
a 200vh scroll-pinned section (`useScrollScene`, matching Hero/02/03's pattern) whose payoff was the
3D building fading from solid to wireframe — at 30% opacity, behind the form, confirmed live to be
essentially imperceptible. So scrolling from the form to the footer meant ~2 screens of scroll that
visibly did nothing, directly adjacent to the one section the visitor is trying to reach next.
Dropped entirely: the section is now normal document flow (matching Trust/Comparison's non-pinned
pattern), `Reveal`-fades in on scroll instead of scrubbing, and the 3D building rests once in its
resolved, fully-assembled state (all floors solid, top floor glowing, wireframe hidden) rather than
mid-transition — "the future of construction," already built, which reads better against this
section's own copy than a wireframe in progress did anyway. Drag-to-orbit and idle auto-rotate on
the building are unchanged; only the scroll-driven material tween is gone. A `ParallaxLayer` glow
orb (using the new `--glow-cyan`/`--glow-emerald` tokens) was added to both Waitlist and Footer so
they still carry *some* depth motion on the way to the page's end, replacing the removed pin with
something actually visible instead of nothing at all. See `context/storyboard.md` § 09 for the full
before/after and `context/sections/09-waitlist.md`/`10-footer.md` for the section-doc updates.

**4. Real Product UI's browser-chrome title bar had a hardcoded dark gradient** (`#16191d →
#101215`) regardless of theme — caught during the same light-mode pass, unrelated to the three
issues above but in a touched file. In light mode this put a near-black title bar over an otherwise
light-mode `bg-surface` card body, reading as a dark-mode mistake rather than a design choice. Now
`linear-gradient(180deg, var(--color-surface-2), var(--color-surface))`, which adapts correctly; the
traffic-light dot colors are unchanged (they read the same in both themes, same as real OS chrome).

All four fixes were verified live in both themes via the dev server (no visual regression in dark
mode — screenshots match pre-change pixel-for-pixel on the Hero) rather than shipped from code
reading alone.

## Zoom parallax + the Waitlist skyline scene (2026-09-01, same day)

Follow-up to the pass above, from a screenshot: the user circled the isometric diamond pattern
sitting behind the Waitlist form (Three.js `gridHelper` inside `BuildingScene3D` — a floor plane
under the building, rendered as a diamond grid by the isometric camera) and asked for it gone,
replaced with something meaningful, plus asked again for the parallax to specifically match
21st.dev's "Horizon Hero Section" (the same paywalled-source reference `HorizonScene.tsx` was
already built from) — "its zooming... use the same animation... create those extra scene."

**Ground grid removed.** One line (`<gridHelper .../>`) deleted from `BuildingScene3D.tsx`. The
building itself (still auto-rotating, still drag-to-orbit) is unaffected — only its floor plane is
gone.

**Zoom added to the parallax primitive.** `useParallax` (`src/lib/use-parallax.ts`) gained an
optional second argument, `zoom` — tweens `scale` from `1` to `1 + zoom` over the same scrub range
as the existing `yPercent` drift, rather than only drifting. This is the "camera pushing into the
scene" read the reference component is known for (its own listing describes "parallax... scroll
animation" with 3D depth; full source is paywalled, so this is a from-scratch behavioural read, not
a copy — same rule as every other community-component adaptation on this site). `ParallaxLayer`
passes it through. Existing glow-orb callers (Trust, Real Product UI) are unchanged — they didn't
ask for zoom, so default `zoom = 0` is a no-op for them.

**Hero's own horizon layers now zoom, not just drift.** `HeroSection.tsx`'s scroll timeline
(`useScrollScene`, not the generic hook — it rides the Hero's single pinned timeline for reasons
already documented under "Community components: liquid-text + parallax") now tweens `scale`
alongside `yPercent` on all three `HorizonScene` layers: stars 1→1.05, mountain 1→1.12, glow
1→1.35. Glow zooms most (nearest layer), mountain least (it's anchored to the ground — its
`transformOrigin` is set to `50% 100%` so it grows upward from its own base instead of drifting off
the horizon line), stars in between. Faster-growing near layers vs. slower-growing far ones is the
same depth cue real dolly-zoom parallax uses.

**New scene: `SkylineHorizonScene.tsx`**, replacing the deleted ground grid as the Waitlist
section's backdrop (`WaitlistSection.tsx` now renders it in place of the plain `GridGlow`). Same
visual grammar as `HorizonScene` — glow + silhouette + drifting particles — but a skyline instead
of a mountain ridge, which is the "meaningful" part of the ask: it bookends the Hero's night-sky
blueprint scene with "the skyline now standing," matching this section's own copy ("the future of
construction... with us") rather than being a re-skin for its own sake. Three layers, each its own
`useParallax` call (safe here since Waitlist is normal-flow, not pinned, since the earlier fix in
this same session — see "Light theme: Hero, parallax, and the waitlist/footer scroll" above):
- Glow (`--glow-emerald`, `zoom=0.4`) — the nearest layer, zooms the most.
- Skyline silhouette — an SVG row of flat rectangles at deterministic integer heights (same
  no-`Math.random()` rule as `HorizonScene`'s star field, for the same hydration-mismatch reason),
  filled `var(--foreground)` at low opacity rather than a literal color (`zoom=0.14`, slowest — it's
  the "ground," anchored, and should feel farthest/steadiest).
- Particles (`speed=-0.22`, no zoom) — small `accent-bright` dots drifting *up* relative to scroll
  (negative speed), read as production activity rising off the skyline.

**Unlike `HorizonScene`, this new scene is theme-aware, not locked dark.** The Waitlist section
follows the light/dark toggle (per the earlier fix this same session), so every layer is built from
tokens (`var(--foreground)`, `--glow-emerald`) rather than hex literals — same technique
`.bg-blueprint-grid` already uses. Verified live in both themes: the skyline reads as a soft
silhouette in light mode (dark-on-white at low alpha) and a glowing one in dark mode (light-on-near-
black), with no separate light-mode branch needed.

See `context/sections/09-waitlist.md` for the section-doc update.

## Real flythrough scene, from the actual source (2026-09-01, same day)

The CSS/SVG `HorizonScene` above was a best-effort read of 21st.dev's paywalled "Horizon Hero
Section" preview. Later the same day the user pasted the component's **actual full source**
unprompted, which changed the brief materially — CLAUDE.md's rule is to re-verify against the real
brief when that happens, not keep building on the guess. `HorizonScene.tsx` is deleted;
`HorizonFlythroughScene.tsx` (real Three.js + `EffectComposer`/`UnrealBloomPass`, not CSS/SVG)
replaces it as the Hero backdrop.

**What the reference actually does, and what changed:** the camera dollies through the scene as
the visitor scrolls (`z: 300 → -50 → -700`), and four semi-transparent mountain layers get pushed
far out of frame past a scroll threshold, revealing a deep-space starfield the reference calls
"COSMOS"/"INFINITY." Two deliberate departures, both from explicit user direction, not taste:
1. **The reveal is a distant lit skyline on a plain beyond the hills, not deep space.** User's
   brief: "zoom all the way into the mountain, and on exit see a big city in the distance." Ties
   directly to this site's own idea (production data that already exists but isn't visible without
   the right system) rather than porting the reference's generic sci-fi placeholder copy.
2. **One progress value off this section's existing pinned `ScrollTrigger`, not `window.scrollY`
   across extra stacked DOM sections.** `HeroSection` tweens a plain `{ value: 0..1 }` proxy object
   on its own timeline (same "tween a non-DOM object directly" trick `WaitlistSection` already uses
   for `BuildingScene3D`'s material intensities); the scene reads `.value` every animation frame.
   Keeps this site's one-wrapper/one-timeline pinned-scene pattern intact instead of introducing a
   second scroll mechanism.

**Camera choreography — four beats**, arrived at after a live round of user-directed tuning (not
the original 3-stop plan):
1. `0.00 → 0.35` zoom toward the mountain (establishing → closing in)
2. `0.35 → 0.60` the transition — mountains part (`clear = smoothstep(0.35, 0.6, progress)`),
   drifting sideways and fading out, not just vanishing
3. `0.60 → 0.80` zoom in close on the newly-revealed city
4. `0.80 → 1.00` pull back out — the city recedes into the distance, the section's closing beat

`HeroSection`'s wrapper went `h-[200vh] → h-[300vh]` to give four beats room; three didn't fit the
old two-screens-of-scroll budget without feeling rushed.

**Live-tuning log** (every one of these was a real defect caught by watching it run, not a
subtlety — recorded so the next pass doesn't have to rediscover them):
- **Mountains invisible at rest.** First pass used near-`--background` fill colors for an
  "on-brand dark" look; against this scene's own near-black fog they had ~zero contrast. Added a
  horizon-glow billboard behind the nearest layer (the "false sun" read `HorizonScene`'s own glow
  layer and the reference's white circle both already used) and lifted the fill colors — twice
  ("mountains are black, can't visualize that" on the first lift) — to a clearly-legible dark
  emerald-slate gradation with real atmospheric perspective (nearest lightest, farthest darkest).
- **Glow oversized, washed the headline.** First glow pass (520-unit plane, 0.9 alpha) bloomed into
  a near-solid green fill that dropped the subheadline's contrast to unreadable. Shrunk to 260
  units, alpha to 0.35, bloom strength 0.55→0.4.
- **Star rotation too fast.** Shader's angle multiplier cut 5x (0.015→0.003).
- **Mountain layers had a diagonal tearing artifact.** Four overlapping transparent meshes were all
  writing depth, fighting each other for sort order as the camera moved — `depthWrite: false` on
  transparent decorative meshes that don't need to occlude each other, same fix `ParallaxLayer`'s
  underlying pattern already assumes.
- **City buildings read as a CAD wireframe, not a city.** First pass gave every building a flat
  unlit color plus a bright neon edge outline. Bodies are now `MeshStandardMaterial` under one
  ambient + one directional light (added for the city alone — everything else in the scene stays
  intentionally unlit); the neon edge + rooftop beacon light is now only on 1-in-4 "beacon"
  buildings — a real skyline is mostly dark mass with a few towers actually lit, scarcity is what
  sells "lit," not coverage.
- **Buildings had no windows** at the distances this scene's camera actually reaches. Added
  `createWindowTexture()` — a canvas-drawn window grid (4 shared seed variants, not one canvas per
  building) applied as both `map` and `emissiveMap`, tiled vertically so window size stays roughly
  constant regardless of building height. First grid (6×16 cells) was confirmed too fine to resolve
  from typical camera distance ("the windows are not here"); cut to a coarser 4×9 grid with bigger,
  higher-contrast cells.
- **Building heights repeated visibly** — `(i * 47) % 190` has an obvious period at 22 buildings
  ("doesn't look like a loop of buildings"). Replaced with `hash01()`, a real integer-hash
  pseudo-random generator (multiply-xor-shift, `Math.imul` throughout) — deterministic and
  bit-identical server/client like every other position calc on this site, but with none of a
  linear formula's visible periodicity.
- **The revealed city had nothing behind it** — once the foreground mountains cleared, the skyline
  sat in an empty starfield. User: "the hills will be behind the city." Added a second, calmer
  ridge silhouette (`backdrop`/`backdropRim`) fixed just behind the city group (z −1080, lower
  relief, dimmer, not tied to `clear` — it's scenery for the destination, not another obstacle to
  fly through), giving the reveal a real valley composition.
- **Every building was a box.** Every 6th building is now a low-poly `CylinderGeometry` tower
  instead, per "curves of building."

**Budget note:** star count cut ~10x from the reference (one ~1,400-point field, not three
5,000-point fields) and the atmosphere shell it also has was dropped entirely — this canvas runs
alongside `BuildingScene3D` elsewhere on the page, and Hero is the one section guaranteed on-screen
at first load, so it carries the most conservative budget on the site.

## The flythrough scene, corrected: a real 180° turn, Denver-style composition (2026-09-01, later still)

The round above still had the city positioned *beyond* the mountain (camera flies past it, mountain
fades away) — geometrically simple, but it can only produce "mountain gone, city alone," never
"mountain behind city." User supplied two photo references (a Denver skyline shot with snow peaks
filling the background, and a dense lit-window night skyline) and corrected the brief: the camera
climbs and crests the ridge, then performs a **real 180° yaw rotation** (confirmed explicitly over a
straight dolly-reverse, via AskUserQuestion — this was a large enough geometry change to verify before
rebuilding), revealing a city that was positioned behind the ridge the whole time, with the mountain
now filling the background behind the skyline once the turn completes.

**What changed, concretely** (`HorizonFlythroughScene.tsx`, effectively a full rewrite):
- **Yaw driven separately from camera position.** `yawAt(progress)` sweeps 0→π over a tight 16%
  scroll window (0.42–0.58) via `smoothstep`, independent of the position lerp — the turn reads as
  one deliberate beat, not something that falls out of a single interpolation. `applyProgress` builds
  the look-at target each frame from `camera.position + forward(yaw) * 400` rather than a fixed point.
- **City moved to the opposite side of the ridge** (`CITY_Z = 420`, positive — the mountain sits at
  negative z) with a second backdrop ridge beyond it (`BACKDROP_Z = 820`). The mountain the camera
  climbs needs no opacity/fade animation anymore — once yaw reaches π it's simply outside the
  camera's forward frustum, which is what let the old `clear`-based drift/fade logic be deleted
  entirely.
- **Ground, roads, and trees** added under the city (a ground plane, two road strips, one
  `InstancedMesh` of 40 cone "trees" — a single draw call regardless of count) — user's explicit
  "there will be some ground... roads, trees."
- **Backdrop mountain rescaled and alpenglow-tinted.** First cut sized it against a low street-level
  final camera and it read as a low sliver hidden behind the buildings; once the final shot became a
  proper elevated overlook it needed real height (peak amplitude 70+130, well above the tallest
  building) and a per-vertex color gradient (dark navy base → pink-white near the peaks) to catch the
  Denver reference's dusk light. Implemented as vertex colors on the existing silhouette mesh, not a
  second derived shape — a filtered/re-closed point list risked the same self-intersecting-polygon
  bug that caused the earlier mountain-tearing artifact.
- **Final camera stop raised from y=80 to y=170.** At y=80 the camera was below the tallest towers
  (buildings ran up to h=275) and looked *up* at them, filling the frame edge-to-edge instead of
  settling into a wide establishing shot — confirmed live, not a subtlety. Building max height was
  also capped down (230→170 range) for better proportion against the new elevated vantage.
- **Footer/Waitlist skyline got the same window treatment.** `SkylineHorizonScene.tsx`'s buildings
  were flat single-opacity rectangles; added a small per-building SVG window grid (`windowGrid()`),
  roughly half lit in the theme's accent color, half left as the base silhouette — "some windows
  black, some bright," same lesson as the Hero city, applied to this section's lighter-weight SVG
  technique instead of a second WebGL rebuild. Verified legible in both themes.

Full inline reasoning (camera-stop numbers, mountain color history, window-grid resolution, every
live-tuning fix) lives in `HorizonFlythroughScene.tsx`'s own header and inline comments — long enough
that duplicating it here would just drift out of sync; read the file for exact values.

## The flythrough, third staging: one mountain, city on the far side (2026-09-01, final)

The two previous stagings both got "hills behind the city" wrong, and both times the mistake was
the same: treating it as a *rotation* problem. It isn't. What decides whether the mountain ends up
behind the city is **where the city sits along the flight path** — the rotation is free.

The staging that works, confirmed with the user before rebuilding:

```
start ---> [ MOUNTAIN ] ---> [ CITY ] ---> camera ends here, facing back
z=+1200     z=-60..-210      z=-350          z=-980, faces +z
```

One mountain, not two. The camera climbs it, loops over the top, comes down the far side facing
back — so the closing frame is the city with the very ridge it just flew over rising behind it.
Because the depth order from that final vantage is camera → city → mountain, the composition is
guaranteed by construction; no sign of any rotation can break it.

**Rotation is split into two layers, deliberately:**
- **Yaw** (`0 → π`) does the real work of netting the camera to face back.
- **A full 360° pitch loop** (`camera.rotateX`) plays over the same beat as pure flourish. A full
  2π is a no-op, so it *cannot* leave the camera pointing the wrong way — all the load-bearing
  orientation lives in the yaw. The two windows are staggered so it reads as "tumble over the top,
  then settle looking back," not one chaotic spin.

**Five real bugs found by stepping the scroll in small increments** (the previous rounds jumped in
large scroll batches and missed frames entirely — worth doing this way every time):
- **City visible at scroll 0.** The ridge was a raw `sin * height` curve oscillating around zero;
  since the shape is filled from the ridge line *down*, the deep dips were see-through gaps. Now it
  oscillates around a high baseline (`height * (1.25 ± 0.45)`), so the lowest saddle still clears
  the tallest building behind it in angular terms from the opening camera position.
- **Mountain filled the entire opening frame.** A ridge big enough to work as a background subject
  is far too big at the old z=220 start. Start pulled back to z=+1200 so it reads as a distant
  horizon with the starfield above it.
- **Mountain invisible in the final frame.** Its colours were near-black, which was fine while it
  was only ever a foreground silhouette but made it vanish against the night sky once it became the
  background. Now it runs *lighter* with distance (atmospheric perspective) with alpenglow on the
  upper third — the Denver reference's actual relationship, where the range is the brightest thing
  in frame and the city is the dark mass. Fog density also cut (0.0009 → 0.00045); at the old value
  the range was ~44% washed toward black at its viewing distance.
- **Camera ended up inside the city.** The final stop was sized against the city's *centre*, but
  its building bands are 380 deep, so the camera was 80 units from the nearest tower. Last two
  stops moved well past the city's near edge.
- **Dead black frames through the loop.** The mountain layers are flat vertical silhouettes —
  edge-on and invisible from directly above — so at the apex the camera saw nothing. The loop now
  plays *lower and later*, while descending over the city, where there's real 3D geometry to bank
  over. This turned the weakest beat into the best one: a banked aerial with the road grid legible
  below.

**Text legibility:** making the mountain bright enough to read cost contrast on the Hero's
left-aligned copy. Rather than darken it again (which just undoes the fix), the copy gets its own
ground — a left-side scrim gradient, transparent by ~78% across, so the right of the frame where
the city and peaks actually are stays completely unobscured.

**Buildings are flat-illustrated now**, per a reference the user supplied: unlit
`MeshBasicMaterial` (no lighting rig — flat colour fields are the point), canvas-drawn *arched*
windows, a dark outline on every building for graphic edge definition, and a curated palette of
deep jewel tones. Not the reference's literal rainbow — confirmed with the user that the Hero
should stay inside the site's dark/premium range, so it's "borrow the technique, not the palette,"
the same rule every other community-component adaptation here follows. The city also gained a real
road grid the buildings sit *between*, trees, and cars (one `InstancedMesh`, per-instance warm/cool
colours for headlights and taillights).

**Window lights are hash-random, not patterned.** Both scenes used
`(index * 7 + seed * 13) % 10 < 4` — deterministic, but *periodic*, and the repeat was plainly
visible as regular stripes across the skyline. Both now use `hash01()` (`src/lib/hash01.ts`, lifted
to a shared module since two scenes need it) for lit/unlit *and* per-window brightness — uniform
brightness was half of why a window grid read as a texture rather than as windows.

## Accessibility & responsive baseline

Full checklist lives in `MASTER.md`. Non-negotiables worth repeating here: 4.5:1 text contrast
minimum (all defined color pairs already clear this), visible keyboard focus rings, no icon-only
buttons without labels, `prefers-reduced-motion` fallback for every scroll-driven scene, mobile-first
with no horizontal scroll, tested at 375/768/1024/1440px.
