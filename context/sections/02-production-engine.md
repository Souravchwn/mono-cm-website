# 02 — Production Engine

**Visitor should feel:** "I understand what they mean."

## Objective
Explain the fundamental architecture.

## Visual
3D concrete floor slab. User scrolls through:
1. Room selected
2. Production event occurs (e.g. "Concrete poured — 25 m³")
3. System auto-updates: Material −25 m³ · Labor +Production Hours · Equipment +Pump Usage ·
   Schedule +Progress · Cash Flow +Cost · Forecast +Updated Projection

## Copy (exact)
**Key message — make this one of the strongest statements on the page:**
> When production moves on the drawing, everything else moves automatically.

## Interaction notes
This is the first time the visitor sees *cause and effect*, not just a pretty building. The
animation must show the six downstream updates (material, labor, equipment, schedule, cash flow,
forecast) triggering visibly and immediately after the production event — the timing/sequencing is
the whole point. Don't animate all six simultaneously; a staggered reveal that reads left-to-right
or top-to-bottom teaches the causal chain better than a simultaneous flash.

## Open risks
None flagged for this section specifically, but the six auto-updated values shown must not read as
real project data — treat them the same as the Section 05 demo-data rule if any numbers are shown
beyond the "25 m³" example concentration already in the spec.

## Implementation note
An isometric floor-slab treatment (matching the Hero building's projection) was tried here and
reverted — the flat CSS grid of room cells reads better for this section. Keep the plain grid;
don't re-attempt the isometric version without reconsidering why it didn't work.
