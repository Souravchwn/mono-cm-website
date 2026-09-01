"use client";

import { useRef, useState } from "react";
import { useScrollScene } from "@/lib/use-scroll-scene";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { HorizonFlythroughScene } from "@/components/scenes/HorizonFlythroughScene";
import { Button } from "@/components/ui/Button";
import { useWaitlistHandoff } from "@/lib/waitlist-handoff";
import { scrollToSection } from "@/lib/scroll-to-section";

const AUDIENCE = ["General Contractors", "Owners", "Subcontractors"];

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
  const wrapperRef = useScrollScene(
    (tl) => {
      tl.to(progressRef.current, { value: 1, ease: "none" });
    },
    () => {
      // Reduced motion: render the scroll-100% end-state directly, per
      // context/storyboard.md's reduced-motion rule.
      progressRef.current.value = 1;
    },
  );

  return (
    <section id="01-hero" aria-label="Hero">
      {/* 300vh, not 200vh — the flythrough is now four beats (zoom, transition,
          city arrival, pull-back), and 200vh made all four feel rushed. */}
      <div ref={wrapperRef} className="relative h-[300vh]">
        <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden border-b border-border px-8 sm:px-16">
          <HorizonFlythroughScene progressRef={progressRef} reducedMotion={reducedMotion} />

          <div className="relative z-[1] mx-auto flex w-full max-w-7xl flex-col items-start gap-6">
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
            <h1 className="font-display text-[clamp(2.75rem,2rem+4vw,5.6rem)] leading-[0.98] font-semibold tracking-tight text-balance text-[#F5F7F8]">
              The{" "}
              <span className="bg-gradient-to-r from-accent-bright to-cyan bg-clip-text text-transparent">
                Production&#8209;Centric
              </span>{" "}
              Construction Engine.
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
