# Data Integrity Checklist

The spec repeatedly warns that this page's credibility depends on never showing a fabricated
number, claim, or piece of social proof as if it were real (Section 08's whole reason for existing
is to counteract "is this real?" suspicion — a single fake-looking stat undermines that). This file
is the consolidated list. **Nothing on this list ships without a verified source.** When a claim
gets verified, update its row here (don't just fix it in the component and let this file go stale).

| Claim | Where it appears | Status | Rule |
|---|---|---|---|
| "The World's First Production-Centric Construction Engine" | Hero (01) headline | **Unverified — do not ship verbatim** | Default to "The Production-Centric Construction Engine." Only use "World's First" if substantiated against competitors. |
| "340+ construction companies already waiting" | Hero (01) indicator, referenced again in Trust (08) | **Unverified — do not ship** | Real number only. Get the actual current waitlist count before publishing any figure here. |
| "$10,000+/year" | Comparison (07) | **Unverified — do not ship** | Independently verify and get sign-off before publishing any specific cost-savings figure. |
| "3–6 months" | Comparison (07) | **Unverified — do not ship** | Same as above — verify before publishing any specific time-savings figure. |
| Customer logos / testimonials / case studies / metrics | Trust (08) "Customer Evidence" | **Not yet available** | Omit the subsection or mark it "coming soon" rather than filling with placeholder-that-looks-real content (stock logos, invented quotes). |
| $12.8M / $8.4M / $7.9M / $9.1M / 67% (Project Dashboard) | Real Product UI (05) | Demo data — OK to show **if visibly labeled** | Must carry a persistent "demo data" label in the UI, not a footnote easy to miss. |
| 84% / 92% / 31% / 58.3 m² / man-day (Production Dashboard) | Real Product UI (05) | Demo data — OK to show **if visibly labeled** | Same labeling rule as above. |
| "Phase 1 pilot is limited to 50 construction companies..." | Waitlist (09) | Conditionally approved phrasing | Only use if the 50-company limit is a real operational constraint. Don't invent a different number or a scarcity framing not backed by fact. |

## Rule of thumb
If you're about to type a number, testimonial, logo, or superlative claim into a component and you
didn't get it from a verified source in this conversation or from the user directly, it goes in
this table as "Unverified" and gets a visible placeholder/label instead of shipping silently.
