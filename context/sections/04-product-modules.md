# 04 — Product Modules (Bento Grid)

**Visitor should feel:** breadth of platform, without it turning into a feature-dump.

## Objective
Show the six product modules as a bento grid.

## Copy (exact)

| Module | Tracks |
|---|---|
| Cash Flow Engine | Project cost, forecast, burn, commitments, cash position |
| Material Lifecycle | Estimate → Purchase → Delivery → Inventory → Consumption → Production |
| Equipment Yard | Equipment, utilization, location, idle time, maintenance |
| Timesheets | Workers, hours, productivity, cost |
| Drawings | Versions, locations, production, changes |
| Production | Quantity, progress, productivity, forecast |

## Interaction notes
Subtle 3D tilt, hover elevation, border glow (emerald, see `design.md` → Elevation), data
animation. **Feel target: premium + technical + controlled — explicitly not "gaming website."**
This is a direct spec warning against overdoing the glow/tilt effect; when in doubt, dial motion
down, not up. See `design-system/mono-cm-website/MASTER.md` → `--elevation-glow` for the
calibrated glow value.

## Open risks
None flagged — no unverifiable claims in this section, but keep an eye on whether "data animation"
per card ends up showing plausible-looking but fabricated numbers; if so it falls under
`context/data-integrity.md`.
