@AGENTS.md

# Mono CM Website

**What this is:** the marketing homepage for Mono CM — "The Production-Centric Construction
Engine." One source of truth for every dollar, drawing, material, and worker on a construction
site. Dark, premium, technical B2B SaaS positioning (Linear/Vercel/Stripe/Apple-adjacent, not
typical construction software).

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + GSAP (`gsap`, `@gsap/react`).

## Mandatory pre-task workflow

Before starting **any** task in this repo — content, layout, animation, or copy — read in this order:

1. This file (`CLAUDE.md`).
2. [`design.md`](./design.md) — the design system: colors, typography, spacing, motion rules,
   component patterns.
3. The relevant file(s) under [`context/`](./context/README.md) for the section or topic you're
   touching (see the index there).

This is default, standing behavior — it applies to every session and every task, not just ones
where it's re-requested. **If a task changes a design or content decision** (a color, a copy line,
a section's animation behavior, a claim, anything the reference layer documents), **update
`design.md` and/or the relevant `context/` file in the same piece of work** — don't leave the docs
stale. The reference layer only stays useful if it's kept current.

## Required skill

The `ui-ux-pro-max` skill is mandatory for any visual/UI/animation/layout decision. Don't
hand-guess colors, spacing, or type — check `design.md` first (already synthesized from this
skill's databases); only invoke the skill directly when a decision isn't already covered there or
the brief changes materially. If you do re-run `--design-system`, **verify the result actually
matches the brief before trusting it** — the initial auto-search for this project returned an
off-topic light-mode palette with a code typeface; `design-system/mono-cm-website/MASTER.md`
documents why it was rejected and rebuilt by hand. Treat future auto-generated output with the
same scrutiny.

## Hard rules (from the content spec — see `context/content-spec.md` for full source)

- **Data integrity is non-negotiable.** Never fabricate metrics, testimonials, logos, or scarcity
  claims. Every number/claim in the spec ("340+ companies," "$10,000+/year," "3–6 months," etc.)
  ships only once independently verified — see [`context/data-integrity.md`](./context/data-integrity.md)
  for the full checklist. Demo data shown in product-UI mockups (Section 05) must stay visibly
  labeled as demo data until real project data exists.
- **No "World's First" claim** unless substantiated against competitors. Default positioning is
  "The Production-Centric Construction Engine."
- **Every animation must explain something.** No decorative-only motion — see `design.md` → Motion.
- **Storyboard-before-animation gate:** don't implement scroll-driven animation/3D for a section
  until [`context/storyboard.md`](./context/storyboard.md) covers that section's scroll behavior
  and it's been confirmed. Build the storyboard first, then Figma → Blender → Canvas frames → GSAP
  → Next.js, per the spec.
- **Section order is deliberate** — Business Outcomes (06) sits after Real Product UI (05), not
  before. Don't "fix" it back to the more obvious ordering.

## Where things live

- `design.md` — human-readable design system (read this first for any visual work).
- `design-system/mono-cm-website/MASTER.md` — raw token reference (hex values, spacing scale,
  contrast ratios, motion presets) that `design.md` is synthesized from.
- `context/README.md` — index of all context files and when to read each one.
- `context/content-spec.md` — verbatim canonical copy source.
- `context/sections/` — one file per page section (objective, visual, exact copy, interaction
  notes, open risks).
- `context/storyboard.md` — scroll-by-scroll storyboard (required gate, see above).
- `context/data-integrity.md` — claims checklist.
- `context/tech-notes.md` — stack rationale, animation production pipeline, open questions.

