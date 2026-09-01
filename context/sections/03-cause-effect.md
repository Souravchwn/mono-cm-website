# 03 — Cause & Effect / Data Flow

**Visitor should feel:** "Holy shit, everything is connected."

## Objective
Establish the conceptual centerpiece of the entire site.

## Visual
One production event → multiple synchronized systems:
```
              PRODUCTION
                  │
       ┌──────────┼──────────┐
       ↓          ↓          ↓
   Material     Labor     Equipment
       │          │          │
       └──────────┼──────────┘
                  ↓
              Schedule
                  ↓
              Cash Flow
                  ↓
               Forecast
```

## Priority
**This is more important than the module grid (04) or any individual feature.** A visitor should
leave this section able to redraw the diagram from memory. This is far more defensible as a pitch
than "we have 20 modules" — give it disproportionate design and engineering care relative to its
size on the page.

## Interaction notes
Section 06 reuses this exact diagram later, resolving into business outcomes — the two sections
should feel like the same visual object recurring, not two different diagrams that happen to be
similar. Keep the node positions/shapes consistent between 03 and 06 so the recurrence reads as
intentional.

## Open risks
None — this section is pure architecture explanation, no numbers/claims requiring verification.
