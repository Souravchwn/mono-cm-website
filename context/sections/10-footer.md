# 10 — Footer

## Status
**Not detailed in the source brief.** The spec only says: standard — nav links, legal, social,
contact. Treat the specifics (exact links, legal pages, which social platforms) as open questions
to confirm with the user before implementing, rather than inventing placeholder links that look
finished — a fake "Privacy Policy" link that 404s is worse than an honestly-omitted one during
early build stages.

## Open risks
- No copy or structure has been approved beyond "standard footer." Confirm before building instead
  of guessing at content.

## Parallax added (2026-09-01)
A `ParallaxLayer` glow orb (bottom-left, `--glow-emerald` token) was added behind the footer
content, matching the treatment already used in Trust/Real Product UI/Waitlist — see `design.md` →
"Light theme: Hero, parallax, and the waitlist/footer scroll." Purely decorative depth motion, same
`GridGlow` background as before.
