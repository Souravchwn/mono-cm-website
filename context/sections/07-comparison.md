# 07 — Competitive Comparison (Visual)

**Visitor should feel:** the architectural advantage, without feeling attacked-at.

## Objective
Position the architectural difference between Mono CM and the legacy model. **Don't attack
competitors directly, and don't present this as a checkmark table.** Show the structural contrast
instead.

## Visual (exact)
```
LEGACY MODEL                         MONO CM

Drawing ──┐                             PRODUCTION
Inventory ┤                                  │
Timesheet ┤──> Separate systems   ┌──────────┼──────────┐
Equipment ┤                       ↓          ↓          ↓
Finance ──┘                    Material    Labor    Equipment
                                   │          │          │
                                   └──────────┼──────────┘
                                              ↓
                                         Cash Flow
                                              ↓
                                          Forecast
```
The fragmentation-vs-unification contrast communicates the architectural advantage far better than
rows of feature checkmarks — resist the urge to add a comparison table alongside this diagram.

## ⚠️ Data integrity — read before implementing
**Do not publish specific claims** (e.g. "$10,000+/year," "3–6 months") **unless independently
verified and defensible.** These are placeholder-style figures in the source brief, not
pre-cleared copy. See `context/data-integrity.md`.

## Interaction notes
The right-hand side (Mono CM) reuses the Section 03/06 production-chain visual — same consistency
requirement applies. The left-hand side (Legacy Model) should read as visually fragmented/disconnected
by design — separate boxes, no unifying flow — as the direct visual opposite of the right side.
