"use client";

/**
 * Adapted from the "liquid-text" / MorphingText community component
 * (21st.dev, @designali-in) — gooey blur-cross-dissolve between words via an
 * SVG feColorMatrix threshold filter. Default demo sizing (40pt–6rem display
 * type) is replaced with a size that fits inline in this site's copy; the
 * morph mechanics are unchanged. Used where the words being cycled are
 * themselves the content (e.g. the six module names) — see design.md's
 * governing animation rule: motion here explains breadth, it isn't
 * decoration bolted onto a static line.
 */
import { useCallback, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

const morphTime = 1.5;
const cooldownTime = 0.5;

const useMorphingText = (texts: string[]) => {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2 || !texts || texts.length === 0) return;

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts],
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = "none";
      current2.style.opacity = "100%";
      current1.style.filter = "none";
      current1.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [doMorph, doCooldown]);

  return { text1Ref, text2Ref };
};

interface MorphingTextProps {
  className?: string;
  texts: string[];
}

function Texts({ texts }: Pick<MorphingTextProps, "texts">) {
  const { text1Ref, text2Ref } = useMorphingText(texts);
  return (
    <>
      <span className="absolute inset-0 inline-block w-full" ref={text1Ref} />
      <span className="absolute inset-0 inline-block w-full" ref={text2Ref} />
    </>
  );
}

// Scoped id (not "filters"/"threshold") so multiple MorphingText instances on
// one page don't collide on the same SVG filter id.
function SvgFilter({ id }: { id: string }) {
  return (
    <svg className="absolute h-0 w-0" aria-hidden="true">
      <defs>
        <filter id={id}>
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 255 -140"
          />
        </filter>
      </defs>
    </svg>
  );
}

export function MorphingText({ texts, className }: MorphingTextProps) {
  const filterId = useId();

  return (
    <div
      className={cn("relative inline-block h-[1.2em] w-full font-display font-semibold", className)}
      style={{ filter: `url(#${filterId}) blur(0.6px)` }}
    >
      <Texts texts={texts} />
      <SvgFilter id={filterId} />
    </div>
  );
}
