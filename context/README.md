# Context Folder Index

Read `CLAUDE.md` and `design.md` first — this folder is the detail layer underneath them. Every
file here should be kept current when a decision it documents changes; see the "mandatory pre-task
workflow" in `CLAUDE.md`.

| File | Read this when... |
|---|---|
| [`content-spec.md`](./content-spec.md) | You need the exact, canonical copy for anything on the page — quote from here, don't paraphrase from memory. |
| [`sections/01-hero.md`](./sections/01-hero.md) … [`10-footer.md`](./sections/10-footer.md) | You're building or reviewing a specific section — objective, visual behavior, exact copy, interaction notes, and that section's open risks, distilled from `content-spec.md`. |
| [`storyboard.md`](./storyboard.md) | Before implementing *any* scroll-driven animation or 3D work — it's a required gate, currently empty, must be filled in and confirmed first. |
| [`data-integrity.md`](./data-integrity.md) | Before shipping any number, testimonial, logo, or superlative claim — consolidated checklist of what's verified vs. not. |
| [`tech-notes.md`](./tech-notes.md) | You need stack rationale, the Figma→Blender→Canvas→GSAP→Next.js pipeline, or the list of open technical questions. |

Section file naming matches the `id` attributes used in `src/app/page.tsx`'s placeholder sections
— e.g. `sections/03-cause-effect.md` documents `<section id="03-cause-effect">`.
