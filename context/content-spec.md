# Mono CM — Homepage Content

> Canonical copy source, verbatim from the original brief
> (`mono-cm-homepage.md`, supplied 2026-08-09). Do not paraphrase copy from
> memory — quote from this file. If copy changes, edit here first, then
> propagate to `context/sections/*.md` and the implementation.

**Positioning:** The Production-Centric Construction Engine
**Message:** One source of truth for every dollar, drawing, material, and worker on your site.

⚠️ **On "World's First":** powerful but factually risky unless researched and defensible. Default to "The Production-Centric Construction Engine" or "A New Production-Centric Construction Engine for Modern Construction." Only use "World's First" if you can substantiate it against competitors.

---

## Page Structure

```
01 — Hero                        "This is different."
02 — Production Engine           "I understand what they mean."
03 — Cause & Effect (Data Flow)  "Holy shit, everything is connected."
04 — Product Modules             (breadth of platform)
05 — Real Product UI             "This is an actual platform."
06 — Business Outcomes           "This could change how we operate."
07 — Comparison (visual)         (architectural advantage, not checkmarks)
08 — Trust / Proof               "They're credible."
09 — Waitlist                    "I should probably get early access."
10 — Footer
```

Revised from the original ordering: **Business Outcomes now sits after Real Product UI**, not before it — architecture talk lands better once the visitor has seen it's a real product, and it converts better as a business-impact statement than a second explanation of the architecture.

---

## 01 — Hero

**Objective:** Create immediate visual authority.

**Visual:** Dark environment, futuristic architectural model. Starts as a blueprint, assembles as the user scrolls:

`Blueprint → Structural Frame → Floor Slabs → MEP → Walls → Completed Building`

**Headline:**
> The World's First Production-Centric Construction Engine.

**Subheadline:**
> One source of truth for every dollar, drawing, material, and worker on your site.

**CTA:**
```
[ Business Email __________________ ]
[ Claim Early Access ]
```

**Supporting indicator:** e.g. "340+ construction companies already waiting." — real number only, never fabricated.

---

## 02 — Production Engine

**Objective:** Explain the fundamental architecture.

**Visual:** 3D concrete floor slab. User scrolls through:

1. Room selected
2. Production event occurs (e.g. "Concrete poured — 25 m³")
3. System auto-updates: Material −25 m³ · Labor +Production Hours · Equipment +Pump Usage · Schedule +Progress · Cash Flow +Cost · Forecast +Updated Projection

**Key message (make this one of the strongest statements on the page):**
> When production moves on the drawing, everything else moves automatically.

---

## 03 — Cause & Effect / Data Flow

**Visual metaphor:** One production event → multiple synchronized systems.

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

**Treat this as the conceptual centerpiece of the entire site** — more important than the module grid or any individual feature. A visitor should leave this section able to redraw the diagram from memory. This is far more defensible than "we have 20 modules."

---

## 04 — Product Modules (Bento Grid)

| Module | Tracks |
|---|---|
| Cash Flow Engine | Project cost, forecast, burn, commitments, cash position |
| Material Lifecycle | Estimate → Purchase → Delivery → Inventory → Consumption → Production |
| Equipment Yard | Equipment, utilization, location, idle time, maintenance |
| Timesheets | Workers, hours, productivity, cost |
| Drawings | Versions, locations, production, changes |
| Production | Quantity, progress, productivity, forecast |

**Interaction:** subtle 3D tilt, hover elevation, border glow, data animation. Feel: *premium + technical + controlled* — not "gaming website."

---

## 05 — Real Product UI

This is the pivot point from marketing visualization to actual software. Show real screenshots.

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

⚠️ All figures above ($12.8M, 67%, 58.3 m²/man-day, etc.) are demo data for UI demonstration purposes. Label them clearly as such until real project data is available — an unlabeled fabricated number undermines the trust the Section 08 proof layer is trying to build.

---

## 06 — Business Outcomes

*(Reframed from "Why Mono CM" — this is no longer a second architecture explanation. It's the business-impact payoff, placed after the visitor has already seen the real product.)*

**Headline:**
> One production event. Six business consequences.

**Visual:** the same production chain from Section 03, now shown resolving into outcomes:

```
Production
   ↓
Material consumption
   ↓
Labor cost
   ↓
Equipment utilization
   ↓
Schedule progress
   ↓
Cash-flow forecast
```

**Closing line:**
> Mono CM doesn't just record what happened on your project. It understands what that event means for everything else.

---

## 07 — Competitive Comparison (Visual)

Position the architectural difference — don't attack competitors directly, and don't present this as a checkmark table. Show the structural contrast instead:

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

The fragmentation-vs-unification contrast communicates the architectural advantage far better than rows of checkmarks.

⚠️ Do not publish specific claims (e.g. "$10,000+/year," "3–6 months") unless independently verified and defensible.

---

## 08 — Trust Layer

Prevents the page from feeling like a concept project.

- **Founder / Team** — who's building Mono CM
- **Engineering** — unified data architecture explanation
- **Real Product** — actual screenshots
- **Customer Evidence** — logos, testimonials, pilot projects, case studies, metrics (when available)
- **Security** — data security, authentication, backup, infrastructure, access control

**Governing rule:** every major visual claim on the page should eventually connect to a real artifact:
```
Claim → 3D demonstration → Actual Mono CM UI → Real project example → Measured outcome
```
A hyper-polished, futuristic site can make skeptical executives *more* suspicious ("is this real?"). Proof isn't a nice-to-have section — treat it as a first-class requirement, not a placeholder.

Same rule applies to the hero's "340+ companies waiting" indicator — only publish once genuinely true.

---

## 09 — Waitlist

**Visual:** reverses the hero animation — exploded view reassembles into the complete building.

**Message:**
> Build the future of construction with us.

### Form

**Required**
- Business Email

**Qualification**
- Company Type: General Contractor / Subcontractor / Developer / Owner
- Annual Project Volume: <$1M / $1M–$5M / $5M–$20M / $20M+

**Optional**
- How many active projects do you currently manage?

### Waitlist Tiers

**Standard — Early Access**
Beta access · Product updates · Launch notifications

**VIP Contractor — Early Design Partner**
Priority onboarding · Direct product feedback · Technical onboarding · Feature-request channel · Early access to selected modules

Avoid artificial scarcity unless real. If pilot slots are genuinely limited:
> "Phase 1 pilot is limited to 50 construction companies so our team can provide hands-on onboarding."

---

## 10 — Footer

*(Not detailed in source plan — standard: nav links, legal, social, contact.)*

---

## Design Notes for This Content

- **Background:** deep charcoal / near-black
- **Primary UI:** white / soft gray
- **Accent:** emerald / electric green
- **Secondary:** subtle blue/gray technical tones
- **Typography:** modern grotesk/sans-serif — closer to Linear, Vercel, Stripe, Apple than typical construction software
- **Animation rule:** every animation must explain something (building separates → explains architecture; material decreases → explains inventory). No decorative-only motion.

---

## Before Building: Storyboard First

Don't start with the 3D animation. Start with a scroll-by-scroll storyboard document:

```
SCROLL 0%   → What does the visitor see? What do they read? What does the building do? What do they understand?
SCROLL 10%  → ...
SCROLL 20%  → ...
SCROLL 30%  → ...
```

Only once that's locked, translate it: **Figma → Blender → Canvas frames → GSAP → Next.js.**
This prevents the common failure mode of a beautiful animation that doesn't actually communicate the product.
