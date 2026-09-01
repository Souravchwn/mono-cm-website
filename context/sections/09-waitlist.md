# 09 — Waitlist

**Visitor should feel:** "I should probably get early access."

## Objective
Convert. This is the primary conversion point of the page (the hero CTA is the secondary/early
one).

## Visual
Reuses the Hero's 3D building asset as a bookend to Section 01, resting in its complete, fully-
assembled state (not scroll-animated) behind the form. **Was** a 200vh scroll-pinned reversal of
the Hero's build-up — dropped 2026-09-01, the effect was imperceptible at the opacity needed to not
fight the form in front of it, so scrolling through the pin read as dead scroll with no visible
payoff. See `context/storyboard.md` § 09 and `design.md` → "Waitlist & Footer: dropped the pinned
reversal, added parallax" for the full reasoning. Drag-to-orbit and idle auto-rotate are unchanged.

**Backdrop is now `SkylineHorizonScene.tsx`** (2026-09-01, same day), not the plain `GridGlow` —
the building used to sit over a Three.js `gridHelper` floor plane (rendered as an isometric diamond
grid); the user flagged it directly (screenshot-annotated) as a stray floor with no purpose, so it
was deleted and replaced with a proper backdrop: a skyline silhouette + glow + rising particles,
same technique as the Hero's `HorizonScene` but theme-aware (this section follows the light/dark
toggle) and zoom-parallax'd. See `design.md` → "Zoom parallax + the Waitlist skyline scene" for the
full build.

## Copy (exact)
**Message:**
> Build the future of construction with us.

### Form
**Required:** Business Email

**Qualification:**
- Company Type: General Contractor / Subcontractor / Developer / Owner
- Annual Project Volume: <$1M / $1M–$5M / $5M–$20M / $20M+

**Optional:** How many active projects do you currently manage?

### Waitlist Tiers
**Standard — Early Access:** Beta access · Product updates · Launch notifications

**VIP Contractor — Early Design Partner:** Priority onboarding · Direct product feedback ·
Technical onboarding · Feature-request channel · Early access to selected modules

## ⚠️ Data integrity — read before implementing
**Avoid artificial scarcity unless real.** If pilot slots are genuinely limited, the approved
phrasing is:
> "Phase 1 pilot is limited to 50 construction companies so our team can provide hands-on onboarding."
Do not invent a different number or urgency framing not backed by an actual operational
constraint.

## Interaction notes
Form should progressively disclose: email first (required, low friction), then qualification
fields, per standard forms/feedback UX guidance (visible labels, no placeholder-only labels,
helper text where useful) — see `design-system/mono-cm-website/MASTER.md` pre-delivery checklist.
