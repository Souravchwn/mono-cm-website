# 05 — Real Product UI

**Visitor should feel:** "This is an actual platform."

## Objective
The pivot point from marketing visualization to actual software. Show real screenshots — this
section should look *less* stylized than the sections around it, not more; the contrast with the
3D/diagram sections is what sells "this is real."

## Copy (exact)

**Project Dashboard**
```
Project Value   $12.8M
Cost            $8.4M
Committed       $7.9M
Forecast        $9.1M
Progress        67%
```

**Production Dashboard**
```
Concrete       84%
Steel          92%
Electrical     31%
Productivity   58.3 m² / man-day
```

**Cash Flow:** animated forecast chart.

## ⚠️ Data integrity — read before implementing
All figures above ($12.8M, 67%, 58.3 m²/man-day, etc.) are **demo data for UI demonstration
purposes only**. They must be **visibly labeled as demo data** in the implementation until real
project data is available. An unlabeled fabricated number here directly undermines the trust the
Section 08 proof layer is trying to build — this is not a minor styling detail, it's load-bearing
for the whole page's credibility argument. See `context/data-integrity.md`.

## Interaction notes
If real product screenshots exist, prefer them over recreated mockups. If mockups are used as a
stand-in, they must still carry the demo-data label — the label requirement isn't contingent on
whether it's a screenshot vs. a recreation.
