# Tech Notes

## Stack
- **Framework:** Next.js 16 (App Router), TypeScript, `src/` directory.
- **Styling:** Tailwind v4 (CSS-first config via `@theme inline` in `src/app/globals.css` — no
  separate `tailwind.config.js`; Tailwind v4 doesn't use one by default).
- **Animation:** GSAP (`gsap` + `@gsap/react`) for scroll-scrubbed timeline sequencing and non-3D
  micro-interactions (ScrollTrigger drives ordinary DOM/SVG sections like 02, 04, 05, 08).
- **3D:** Three.js (via `@react-three/fiber` + `@react-three/drei` for the React/Next.js
  integration) — real-time WebGL, not baked frames. See "3D pipeline" below for why this replaced
  the originally-stated Blender pipeline.
- **Package manager:** pnpm (already used to scaffold; Linux-native Node v24 via nvm resolves
  first on this machine's `PATH`, ahead of any Windows-interop `node`/`npm` — keep using the
  native one for speed and reliability).

## 3D pipeline

**Superseded decision (2026-08-30):** the originally-stated pipeline was
`Figma → Blender → Canvas frames → GSAP → Next.js` — baked frames specifically to avoid shipping a
real-time 3D engine to the browser. The user explicitly decided to reverse this: the site now uses
**real-time Three.js/WebGL** for the hero building assembly and the cause-and-effect diagram
(Sections 01/03/06/09), not pre-rendered Blender frames. Rationale: a live, draggable/orbitable 3D
scene reads as substantially more impressive and "actually 3D" than a scrubbed frame sequence, which
matters for a page whose job is to convert skeptical visitors — see the "fully futuristic" direction
decided for `design.md` around the same time.

This was validated with a working prototype (not just a decision on paper): a Claude Design canvas
mockup embeds a real Three.js scene (isometric `OrthographicCamera`, stacked `BoxGeometry` floors
going from wireframe/blueprint to solid emissive-glow, drag-to-orbit via pointer events, auto-rotate
when idle) for the hero/waitlist building, and a second reusable scene (`PerspectiveCamera`,
glowing `IcosahedronGeometry` nodes, `CatmullRomCurve3` + `TubeGeometry` edges with particles
animated along the curve, HTML labels positioned via `Vector3.project(camera)` each frame) for the
cause-and-effect diagram reused across Sections 03/06/07. Both ran cleanly at 60fps with Three.js
r160 core only (no addons/postprocessing needed for the glow look — emissive materials + additive
particle colors were enough).

**Implementation notes for when this gets built into the real Next.js app:**
- Use `@react-three/fiber` + `@react-three/drei` rather than hand-rolled `useEffect` + raw Three.js
  — same rendering approach, idiomatic React lifecycle/cleanup.
- GSAP ScrollTrigger still drives the *scroll-scrubbing* (when each stage of the building assembly
  reveals, when the diagram resolves) — it hands progress values to the Three.js scene rather than
  being replaced by it. The two tools are complementary, not competing.
- `prefers-reduced-motion`: the auto-rotate/particle-flow idle animation must respect it (freeze on
  a representative frame) per `design.md`'s accessibility baseline — this was not yet needed in the
  mockup (no reduced-motion toggle in a static canvas preview) but is a hard requirement for the
  real build.
- Mobile/low-end performance is a real open question now that this is real-time rendering rather
  than a frame sequence — needs a perf budget check (frame rate on mid-tier mobile GPUs) and a
  fallback (e.g. a static poster image) before shipping, not assumed to "just work."

**Partially superseded (2026-08-30):** the cause-and-effect diagram's Three.js scene
(`DiagramScene3D`/`scene-config.ts`, described above as reused across Sections 03/06/07) was
replaced by an adapted community component (`OrbitalDiagram`, on plain DOM/CSS, no WebGL) — see
`design.md` → "Orbital diagram replaces the 3D scene". The hero/waitlist building scene
(`BuildingScene3D`, Sections 01/09) is unaffected and still real-time Three.js as described above;
only the diagram scene moved off it. `DiagramScene3D.tsx` and `scene-config.ts` no longer exist.

## Open technical questions
- Mobile/low-end WebGL performance budget and fallback strategy (see above) — blocks Sections 01,
  02, 09 for real-device testing.
- Who owns building/maintaining the Three.js scenes (same ownership question the old Blender
  pipeline had, just for scene code instead of baked assets).
- Whether "Real Product UI" (Section 05) will use actual product screenshots or recreated mockups
  — affects whether that section needs its own component library matching the real app's UI, or
  can be built as static images. Either way, the demo-data labeling rule in
  `context/data-integrity.md` applies.
- Footer (Section 10) content is unspecified — see `context/sections/10-footer.md`.

## GSAP + SVG gotcha: group opacity vs. child opacity
The Hero/Waitlist building scenes originally set `opacity={0}` on the *outer* stage `<g>` (e.g.
`<g data-stage="walls" opacity={0}>`) while GSAP tweened the *children's* opacity. That never
worked — SVG (like CSS) composites a group's entire subtree at the group's own opacity, so a
child's opacity of 1 inside a parent at opacity 0 still renders invisible. Fixed by moving
`opacity={0}` onto each individual floor/detail `<g>` instead and pointing GSAP's selectors at
those (`[data-stage="walls"] [data-floor]`, `[data-stage="walls"] [data-detail="roof"]`) — never at
children of a hidden ancestor. Check for this pattern first if a future stage "never appears."

Pinned scene wrapper height was also reduced from `300vh` to `200vh` across Hero/Production
Engine/Cause & Effect/Waitlist — 300vh (200vh of actual scroll distance) read as too slow/draggy
for what each scene actually shows.

Timeline positions in Hero/Waitlist use relative offsets (`"-=0.1"`, `"<"`) rather than
hand-computed absolute 0–1 fractions — with 21+ frame-line elements now animating, fixed fractions
drift out of sync the moment an element count changes. GSAP scrub maps whatever total duration the
timeline computes to the scroll range automatically, so relative sequencing is both simpler and
more robust than manually budgeting fractions of 1.

## Shared isometric projection
`src/lib/iso-projection.ts` holds the 30° isometric projector used by `BuildingIllustration`
(Hero/Waitlist). It was factored out while prototyping an isometric treatment for Section 02's
floor slab — that treatment was reverted (see `context/sections/02-production-engine.md`, the flat
grid reads better there), but the module stays since `BuildingIllustration` still needs it and any
future 3D-placeholder scene should reuse the same projection rather than inventing another one.

## Design-system regeneration note
The first `ui-ux-pro-max --design-system` run for this project returned an off-topic result (a
light "Link-in-Bio" pattern, navy/gold palette, Fira Code typeface) that didn't match the brief at
all. `design-system/mono-cm-website/MASTER.md` was hand-composed instead, using the spec's explicit
brand direction as ground truth and only pulling validated, on-topic pieces from the skill's
databases (the Space Grotesk/DM Sans "Tech Startup" typography pairing, the standard GSAP
page-transition preset). If the brand direction changes enough to warrant re-running the search,
verify the result actually matches before trusting it — don't assume a later run will be accurate
just because the tool ran successfully.
