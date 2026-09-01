"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * One waitlist, two entry points.
 *
 * The Hero and Section 09 each used to own a completely separate email capture,
 * which meant a visitor could "sign up" in the Hero and end up in no list at all
 * (the Hero form had no handler), then scroll down and be asked for their email a
 * second time. Two forms, one of them a dead end, with no relationship between
 * them.
 *
 * This makes the Hero input the *first field* of the Section 09 form rather than a
 * competing one: submitting it carries the address down to the real form, which is
 * where the qualifying detail (company type, project volume, active projects) is
 * collected. Section 09 stays the single place a signup is actually completed.
 *
 * Deliberately not URL state or `sessionStorage` — the handoff only has to survive
 * a scroll within one page view, and a query param would put a business email in
 * the address bar and browser history.
 */
type WaitlistHandoff = {
  /** Address carried over from the Hero, used to prefill Section 09's email field. */
  email: string;
  /** Bumped on each handoff so Section 09 can react even if the address is unchanged. */
  handoffCount: number;
  startHandoff: (email: string) => void;
};

const WaitlistHandoffContext = createContext<WaitlistHandoff | null>(null);

export function WaitlistHandoffProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState("");
  const [handoffCount, setHandoffCount] = useState(0);

  const startHandoff = useCallback((next: string) => {
    setEmail(next);
    setHandoffCount((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({ email, handoffCount, startHandoff }),
    [email, handoffCount, startHandoff],
  );

  return <WaitlistHandoffContext.Provider value={value}>{children}</WaitlistHandoffContext.Provider>;
}

export function useWaitlistHandoff() {
  const ctx = useContext(WaitlistHandoffContext);
  if (!ctx) throw new Error("useWaitlistHandoff must be used inside <WaitlistHandoffProvider>");
  return ctx;
}
