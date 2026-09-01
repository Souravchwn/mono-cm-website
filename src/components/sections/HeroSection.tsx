"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useScrollScene } from "@/lib/use-scroll-scene";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { HorizonFlythroughScene } from "@/components/scenes/HorizonFlythroughScene";
import { Button } from "@/components/ui/Button";
import { useWaitlistHandoff } from "@/lib/waitlist-handoff";
import { scrollToSection } from "@/lib/scroll-to-section";

const AUDIENCE = ["General Contractors", "Owners", "Subcontractors"];

/**
 * Headline, split for the per-character entrance animation the 21st.dev
 * reference is built around (its `splitTitle` + staggered `gsap.from`).
 *
 * The gradient on "Production-Centric" can't survive that split: `bg-clip-text`
 * needs one contiguous element, and animating each letter as its own
 * transformed inline-block would either break the clip or restart the gradient
 * inside every letter. So the gradient is *sampled per character* instead —
 * each letter gets a colour interpolated emerald→cyan across the word, which
 * looks identical at rest and leaves every letter independently animatable.
 * Copy itself is unchanged (canonical, see context/content-spec.md).
 */
const ACCENT_FROM = [52, 211, 153] as const; // #34D399
const ACCENT_TO = [34, 211, 238] as const; // #22D3EE

const HEADLINE_SEGMENTS = [
  { text: "The", gradient: false },
  { text: "Production‑Centric", gradient: true },
  { text: "Construction", gradient: false },
  { text: "Engine.", gradient: false },
];

// Total gradient-word length, so colour ramps across the whole word.
const GRADIENT_LEN = HEADLINE_SEGMENTS.find((s) => s.gradient)!.text.length;

function gradientColor(index: number) {
  const t = GRADIENT_LEN > 1 ? index / (GRADIENT_LEN - 1) : 0;
  const c = ACCENT_FROM.map((from, i) => Math.round(from + (ACCENT_TO[i] - from) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function HeroSection() {
  const reducedMotion = useReducedMotion();
  // This input is the first field of Section 09's form, not a second competing
  // signup: submitting it carries the address down to that form (which collects
  // company type and project volume) and scrolls there. Before, it was
  // `onSubmit={(e) => e.preventDefault()}` and nothing else — a visitor could
  // type an address, press the page's primary CTA, and get no response at all.
  const { startHandoff } = useWaitlistHandoff();
  const [email, setEmail] = useState("");

  // Drives the Three.js flythrough (HorizonFlythroughScene) rather than
  // tweening DOM refs — a plain object with a numeric property is a valid
  // GSAP tween target (same trick WaitlistSection uses to tween
  // BuildingScene3D's material intensities directly), so the scene just
  // reads `.value` every animation frame instead of this section owning a
  // second scroll listener. Riding this pinned section's own scroll-scrubbed
  // timeline, not an independent ScrollTrigger, for the usual reason: both
  // live inside the `sticky` pinned viewport, which never itself translates
  // during the pin, so a separately-triggered ScrollTrigger would compute
  // its start/end off already-stuck geometry.
  const progressRef = useRef({ value: 0 });
  const copyRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useScrollScene(
    (tl) => {
      tl.to(progressRef.current, { value: 1, ease: "none" });
      // The copy rides the same zoom the camera does — a subtle scale-up and
      // drift so the text feels attached to the scene rather than pasted over
      // it. Deliberately small and opacity-free: this block holds the primary
      // CTA, so it has to stay fully legible and clickable at every point in
      // the scrub.
      if (copyRef.current) {
        tl.to(copyRef.current, { scale: 1.06, yPercent: -4, ease: "none" }, 0);
      }
    },
    () => {
      // Reduced motion: render the scroll-100% end-state directly, per
      // context/storyboard.md's reduced-motion rule.
      progressRef.current.value = 1;
    },
  );

  // Per-character entrance — the reference component's signature move
  // (`gsap.from` on split chars, staggered, power4.out). Runs once on mount,
  // independent of the scroll timeline above.
  useGSAP(
    () => {
      if (reducedMotion || !copyRef.current) return;
      const chars = copyRef.current.querySelectorAll<HTMLElement>(".hero-char");
      if (!chars.length) return;
      gsap.from(chars, {
        yPercent: 115,
        opacity: 0,
        duration: 1.1,
        stagger: 0.022,
        ease: "power4.out",
      });
    },
    { scope: copyRef, dependencies: [reducedMotion] },
  );

  return (
    <section id="01-hero" aria-label="Hero">
      {/* 300vh, not 200vh — the flythrough is now four beats (zoom, transition,
          city arrival, pull-back), and 200vh made all four feel rushed. */}
      <div ref={wrapperRef} className="relative h-[300vh]">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden border-b border-border px-8 sm:px-16">
          <HorizonFlythroughScene progressRef={progressRef} reducedMotion={reducedMotion} />

          <div
            ref={copyRef}
            className="relative z-[1] mx-auto flex w-full max-w-7xl flex-col items-start gap-6"
            style={{ transformOrigin: "0% 50%" }}
          >
            {/* Fixed dark-mode accent (#34D399), not the theme token: in light
                mode --accent-bright is a darker #059669 tuned for contrast on
                a light page background, which reads poorly against this
                section's always-dark horizon-scene backdrop. */}
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-label font-display font-medium tracking-wide uppercase"
              style={{
                borderColor: "rgba(52,211,153,0.35)",
                backgroundColor: "rgba(16,185,129,0.1)",
                color: "#34D399",
              }}
            >
              Production-Centric Construction Engine
            </span>
            {/*
              text-[#F5F7F8]/text-[#9AA4AC] rather than text-foreground/-muted:
              HorizonScene behind this content is a fixed night-sky backdrop
              that deliberately does not follow the light/dark toggle (see
              design.md — same "always dark" scoping as the old audience-band
              exception). With the theme tokens, this heading flipped to
              near-black in light mode and became unreadable against its own
              dark background — confirmed live before this fix.
            */}
            {/*
              Split per character for the staggered entrance (see
              HEADLINE_SEGMENTS above). `aria-label` carries the real sentence
              so assistive tech reads it as one string rather than spelling out
              40 individual letter spans; the visual spans are aria-hidden.

              Two things deliberately absent, both of which broke this when
              tried: `overflow-hidden` on the word wrappers (intended as a
              reveal mask, but it clipped the long gradient word — the tail of
              "Production-Centric" was cut off and re-rendered on the wrong
              line), and `text-balance` on the h1 (its line-balancing fights a
              headline built from inline-block spans). The reference component
              animates y + opacity with no mask either, so nothing is lost.

              The font-size clamp is retuned for phones: "Production‑Centric" is
              18 characters joined by a non-breaking hyphen inside a
              `whitespace-nowrap` wrapper, so it can never wrap — it has to
              *fit*. The previous `clamp(2.75rem, 2rem+4vw, …)` resolved to
              ~49px on a 420px screen, needing ~435px against the ~356px
              available inside the page padding, and overflowed. This curve
              lands ~37px there while resolving identically from ~1500px up, so
              desktop sizing is unchanged.
            */}
            <h1
              aria-label="The Production-Centric Construction Engine."
              className="font-display text-[clamp(2.3rem,0.9rem+5.2vw,5.6rem)] leading-[0.98] font-semibold tracking-tight text-[#F5F7F8]"
            >
              {HEADLINE_SEGMENTS.map((segment, si) => (
                <span key={si} aria-hidden="true" className="inline-block whitespace-nowrap">
                  {Array.from(segment.text).map((char, ci) => (
                    <span
                      key={ci}
                      className="hero-char inline-block"
                      style={segment.gradient ? { color: gradientColor(ci) } : undefined}
                    >
                      {char}
                    </span>
                  ))}
                  {si < HEADLINE_SEGMENTS.length - 1 ? " " : null}
                </span>
              ))}
            </h1>
            <p className="max-w-md text-lg text-[#9AA4AC]">
              One source of truth for every dollar, drawing, material, and worker on your site.
            </p>
            <div className="mt-2 flex w-full flex-wrap items-center gap-4">
              <form
                className="flex w-full max-w-sm flex-col gap-3 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  startHandoff(email);
                  scrollToSection("09-waitlist");
                }}
              >
                <label htmlFor="hero-email" className="sr-only">
                  Business email
                </label>
                <input
                  id="hero-email"
                  type="email"
                  required
                  // autoComplete/inputMode let the browser and mobile keyboard
                  // do their job — both were missing on every field on the site.
                  autoComplete="email"
                  inputMode="email"
                  placeholder="Business email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="panel-ring h-[50px] flex-1 rounded-[10px] bg-surface px-4.5 text-sm text-foreground placeholder:text-foreground-muted focus-visible:outline-2 focus-visible:outline-ring"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-br from-accent-bright to-accent"
                  style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 0 30px -4px rgba(16,185,129,0.55)" }}
                >
                  Claim Early Access
                </Button>
              </form>
              <a
                href="#02-production-engine"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F5F7F8] opacity-90 transition-colors duration-150 hover:text-accent-bright hover:opacity-100"
              >
                See it in action <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/*
        Floating proof card — overlaps the hero/next-section seam instead of
        being its own flat centered slide (the previous "light paper band"
        implementation was exactly that flatness problem, just in a different
        palette — see design.md → "Premium material pass"). Negative margin
        pulls it up into the hero; normal flow after it resumes at Section 02.
      */}
      <div className="relative z-[2] mx-auto -mt-16 max-w-3xl px-8 sm:px-0">
        <div className="panel-floating flex flex-wrap items-center gap-6 rounded-2xl p-6">
          <div className="flex flex-wrap gap-2.5">
            {AUDIENCE.map((role, i) => (
              <span
                key={role}
                className="panel-ring rounded-full bg-background px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap text-foreground"
                style={{
                  transform: i === 1 ? "translateY(-3px)" : i === 2 ? "translateY(2px)" : undefined,
                }}
              >
                {role}
              </span>
            ))}
          </div>
          <div className="h-full w-px self-stretch bg-border" />
          <p className="text-sm text-foreground-muted">
            One production record — every phase, cost, and crew, not five disconnected tools.
          </p>
        </div>
      </div>
    </section>
  );
}
