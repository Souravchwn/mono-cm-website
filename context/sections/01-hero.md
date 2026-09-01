# 01 — Hero

**Visitor should feel:** "This is different."

## Objective
Create immediate visual authority.

## Visual
Dark environment, futuristic architectural model. Starts as a blueprint, assembles as the user
scrolls: `Blueprint → Structural Frame → Floor Slabs → MEP → Walls → Completed Building`.

## Copy (exact)
- **Headline:** "The World's First Production-Centric Construction Engine." — **do not ship this
  verbatim.** Default to "The Production-Centric Construction Engine" or "A New Production-Centric
  Construction Engine for Modern Construction" unless "World's First" has been independently
  substantiated against competitors. See `context/data-integrity.md`.
- **Subheadline:** "One source of truth for every dollar, drawing, material, and worker on your site."
- **CTA:** email input (`Business Email`) + button (`Claim Early Access`).
- **Supporting indicator:** e.g. "340+ construction companies already waiting." — **real number
  only**. Do not publish any figure here until it's genuinely true.

## Interaction notes
The building-assembly animation is scroll-scrubbed, not autoplaying — it's the visitor's own
scroll that drives blueprint → completed building. This is the first animation on the page and
sets the "every animation explains something" contract: here it explains that Mono CM understands
the full construction process, stage by stage.

## Open risks
- "World's First" claim (blocked until substantiated).
- "340+ companies" indicator (blocked until real).
- The 3D building asset itself is a production dependency — see `context/tech-notes.md` for the
  Figma → Blender → Canvas → GSAP pipeline and who owns it.

## v2 update (2026-08-30) — see design.md → "Hero direction v2"

Amplified per the user's "mix A and C" call on a Procore/Fieldwire-inspired comp comparison:
badge above the headline, gradient treatment on "Production-Centric" (copy unchanged), a
secondary "See it in action" anchor link, and — new — a light "audience band" closing beat
(General Contractors / Owners / Subcontractors cards behind a diagonal seam) that sits after the
pinned 3D scene but is still part of this section, not a new numbered section. Also fixed a bug
where the building rendered as a fully empty canvas at rest (`opacity: 0` defaults with no
explicit at-rest `gsap.set`, unlike `WaitlistSection`) — the wireframe blueprint is now visible
immediately on load per the "starts as a blueprint" spec, rather than only after scrolling.

A persistent site nav (`src/components/Header.tsx`) was added at the same time — the homepage had
none before. It renders `fixed`, not `sticky`: `sticky` intermittently failed to repaint once
scrolled past this page's pinned/scroll-scrubbed sections (DOM/CSS confirmed correct, paint did
not) — see design.md for detail.

## Light theme: text stays fixed, background doesn't follow the toggle (2026-09-01)

"Dark environment" above is literal, not just a default — the Hero's backdrop is a fixed night-sky
scene that does not switch with the light/dark theme toggle (same "always dark" scoping as this
section's former audience-band cards). The headline, subheadline, "See it in action" link, and
eyebrow badge inside the pinned viewport use fixed dark-mode colors (`#F5F7F8`/`#9AA4AC`/`#34D399`),
not the `--foreground`/`--accent-bright` tokens — with the tokens, switching to light mode flipped
this text toward near-black and it went unreadable against its own backdrop (confirmed live). See
`design.md` → "Light theme: Hero, parallax, and the waitlist/footer scroll" for the full fix and why
it's scoped to just this section.

## Real flythrough scene replaces the CSS/SVG horizon (2026-09-01, later same day)

The CSS/SVG `HorizonScene` referenced above didn't survive the day — the user pasted 21st.dev's
actual "Horizon Hero Section" source in full, which turned out to be a real Three.js camera
flythrough (mountains parting to reveal something beyond them), not the flat parallax drift the
paywalled preview implied. `HorizonScene.tsx` is deleted; `HorizonFlythroughScene.tsx` (real
Three.js + bloom) is the Hero backdrop now, and everything the "Zoom parallax" note used to describe
is superseded by it.

Four-beat camera path, per the user's own brief ("one scroll for the zoom, then transition, then
zoom on the city, then another scroll [where] the camera will be in the distance and the city will
be going far"): zoom toward the mountain → the mountains part → zoom in close on the revealed city
→ pull back out as the city recedes. The reveal itself is a distant lit skyline, not the reference's
deep-space placeholder — "the production data was there the whole time, you just couldn't see it
yet" is a real Mono CM idea; the reference's own payoff wasn't.

**Final staging (2026-09-01), after two wrong attempts.** Both earlier versions tried to get "hills
behind the city" via camera rotation; that was the wrong lever. It's decided by *where the city sits
along the flight path*:

```
start ---> [ MOUNTAIN ] ---> [ CITY ] ---> camera ends here, facing back
z=+1200     z=-60..-210      z=-350          z=-980, faces +z
```

One mountain, not two. The camera climbs it, does a full 360° loop coming over the top, and
descends the far side facing back — so the closing frame is the city with that same ridge behind
it (the Denver reference's composition), guaranteed by depth order rather than by rotation math.
The loop is pure flourish layered on a yaw that does the actual turning; a full 2π nets to a no-op,
so it can't leave the camera facing wrong.

The city is flat-illustrated (arched windows, deep jewel tones, graphic outlines) with a road grid,
trees and cars — the user's "I'm building a real world in the software." Full build log, all five
live-found bugs, and the palette reasoning in `design.md` → "The flythrough, third staging: one
mountain, city on the far side."

`HeroSection`'s pin went `h-[200vh] → h-[300vh]` to give four beats room without feeling rushed.
