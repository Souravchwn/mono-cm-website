# Design System Master File

> **LOGIC:** When building a specific page/section, first check `design-system/mono-cm-website/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file. Otherwise, follow the rules below.
>
> **Provenance note:** the `ui-ux-pro-max --design-system` auto-search for this project returned an
> off-topic match (a light-mode "Link-in-Bio" pattern with navy/gold colors and a code typeface) —
> it did not fit a dark, premium, technical construction-SaaS landing page. This file is hand-composed
> instead, using the client's explicit brand direction (`context/content-spec.md` → "Design Notes for
> This Content") as ground truth, cross-checked against the `ui-ux-pro-max` color/typography/motion
> databases for validated pairings, and verified for WCAG contrast with a manual calculation (ratios
> below). Re-run the search tool if the brand direction changes materially, but treat any future
> auto-generated result with the same scrutiny — verify it actually matches the brief before trusting it.

---

**Project:** Mono CM Website
**Category:** Premium Technical B2B SaaS — Dark Mode Marketing Site
**Generated:** 2026-08-09

---

## Global Rules

### Color Palette

Dark charcoal base, soft-white text, emerald accent, blue-gray secondary — per spec. All pairs below are contrast-checked (WCAG formula, not estimated).

| Role | Hex | CSS Variable | Contrast vs. its paired surface |
|------|-----|--------------|----------------------------------|
| Background (base) | `#0A0B0D` | `--color-background` | — |
| Surface (elevated card/panel) | `#14171A` | `--color-surface` | — |
| Foreground (primary text) | `#F5F7F8` | `--color-foreground` | 18.3:1 on background (AAA) |
| Foreground Muted (secondary text) | `#9AA4AC` | `--color-foreground-muted` | 7.8:1 on background (AAA) |
| Accent — Emerald (buttons, glow, key stats) | `#10B981` | `--color-accent` | 7.8:1 on background (AAA) |
| Accent Bright (icons, highlights, active states) | `#34D399` | `--color-accent-bright` | 10.2:1 on background (AAA) |
| On-Accent text (text placed on accent bg) | `#0A0B0D` | `--color-on-accent` | 7.8:1 on accent (AA) — **white text on the accent fails at 2.5:1, never use it** |
| Secondary — blue/gray technical tone | `#94A3B8` | `--color-secondary` | 7.7:1 on background (AAA) |
| Border (hairline) | `rgba(255,255,255,0.08)` | `--color-border` | decorative only, not text |
| Destructive / error | `#F87171` | `--color-destructive` | 7.1:1 on background (AAA) |
| Focus ring | `#34D399` | `--color-ring` | matches accent-bright |

**Rule:** never pair the `--color-accent` (`#10B981`) background with white text — it fails AA (2.5:1). Always use `--color-on-accent` (near-black) for text/icons sitting on a solid accent fill. Light-on-accent (white) is only safe for accent used as *text on the dark background*, not as a filled surface.

### Typography

- **Heading / Display Font:** Space Grotesk (weights 500–700)
- **Body Font:** DM Sans (weights 400–500)
- **Mood:** technical, modern grotesk, premium SaaS — closer to Linear/Vercel/Stripe/Apple than typical construction software (per spec)
- **Source:** `ui-ux-pro-max --domain typography` "Tech Startup" pairing — validated fit for SaaS/developer-tool/premium-technical positioning
- **Fallback stack:** `Inter` (if Space Grotesk/DM Sans licensing or loading becomes an issue — same grotesk family feel, used by Linear itself)
- **Google Fonts:** `https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap`

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
```

**Scale:**

| Token | Size / Line-height | Usage |
|-------|---------------------|-------|
| `--text-hero` | 56–96px / 1.05 | Section 01 headline, fluid via `clamp()` |
| `--text-h1` | 40–56px / 1.1 | Section headlines |
| `--text-h2` | 28–36px / 1.2 | Sub-section headings |
| `--text-body-lg` | 18–20px / 1.5 | Lead paragraphs, subheadlines |
| `--text-body` | 16px / 1.5 | Base body text (never below 16px per UX rules) |
| `--text-label` | 12–13px / 1.4 | Data labels, badges, dashboard chips |

### Spacing Variables

*Density: Standard (marketing page, not a dashboard) — see `--density` note in `context/tech-notes.md` if Section 05's real-product-UI mockups need a denser, dashboard-specific scale.*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | Tight gaps, icon-to-label |
| `--space-sm` | `8px` | Inline spacing, chip padding |
| `--space-md` | `16px` | Standard component padding |
| `--space-lg` | `24px` | Card padding, form field gaps |
| `--space-xl` | `32px` | Component-to-component gaps |
| `--space-2xl` | `48px` | Sub-section margins |
| `--space-3xl` | `96px` | Section-to-section margins (full-bleed scroll sections) |

### Elevation (dark-theme — box-shadow reads as invisible on near-black, use border + glow instead)

| Level | Value | Usage |
|-------|-------|-------|
| `--elevation-flat` | `border: 1px solid var(--color-border)` | Default card |
| `--elevation-raised` | `border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 8px 24px rgba(0,0,0,0.4)` | Hover state |
| `--elevation-glow` | `box-shadow: 0 0 0 1px var(--color-accent-bright), 0 0 32px rgba(52,211,153,0.25)` | Active/selected module card (Section 04 bento grid) |

---

## Motion

**Governing rule (from spec, non-negotiable):** every animation must explain something — building assembles to explain architecture, material bar decreases to explain inventory consumption, diagram nodes light up in sequence to explain data flow. No decorative-only motion.

**Baseline transition:** GSAP, `power2.inOut`, 150–300ms for UI-state changes (buttons, hovers, cards). Scroll-driven storytelling sections (01, 02, 03, 06, 07, 09) use scrubbed ScrollTrigger timelines, not fixed-duration transitions — their pacing is tied to scroll position, and their exact choreography is defined in `context/storyboard.md` (must be filled in before implementation).

**Reference preset (route/section transitions only):**
```js
const tl = gsap.timeline();
tl.to('.transition-overlay', { yPercent: 0, duration: 0.4, ease: 'power2.inOut' })
  .call(navigate)
  .to('.transition-overlay', { yPercent: -100, duration: 0.4, ease: 'power2.inOut', delay: 0.1 });
```
Keep the overlay element mounted at the layout root so it survives route/section swaps.

**Always respect `prefers-reduced-motion`:** provide a static/cross-fade fallback for every scroll-driven scene.

---

## Pre-Delivery Checklist (from `ui-ux-pro-max` + spec-specific additions)

- [ ] No emojis as icons — SVG only (Heroicons/Lucide)
- [ ] `cursor: pointer` on all clickable elements
- [ ] Hover/focus states with 150–300ms transitions
- [ ] Text contrast ≥ 4.5:1 (all pairs above are pre-verified — don't introduce new ad hoc colors without checking)
- [ ] Visible focus ring for keyboard nav (`--color-ring`)
- [ ] `prefers-reduced-motion` respected on every scroll-driven scene
- [ ] Responsive at 375px, 768px, 1024px, 1440px — mobile-first, no horizontal scroll
- [ ] Every animation maps to an explanation (spec rule) — if you can't state what it explains, cut it
- [ ] Any number/metric shown (demo dashboards, "340+ companies," etc.) is either real or visibly labeled as demo data — see `context/data-integrity.md`
