/**
 * Minimal inline SVG icons — style rule: SVG only, never emoji as icons.
 * Deliberately simple line-icons; not a full icon set, just the 6 module glyphs.
 */
const shared = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CashFlowIcon() {
  return (
    <svg {...shared} className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M9.5 10a2.5 2.5 0 0 1 2.5-1.5c1.5 0 2.5.8 2.5 1.8 0 2.2-5 1-5 3.2 0 1 1 1.8 2.5 1.8a2.5 2.5 0 0 0 2.5-1.5" />
    </svg>
  );
}

export function MaterialIcon() {
  return (
    <svg {...shared} className="h-5 w-5" aria-hidden="true">
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
      <path d="M4 7l8 4 8-4M12 11v10" />
    </svg>
  );
}

export function EquipmentIcon() {
  return (
    <svg {...shared} className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m14.5-6.5-1.4 1.4M6.9 17.1l-1.4 1.4m0-13 1.4 1.4M17.1 17.1l1.4 1.4" />
    </svg>
  );
}

export function TimesheetsIcon() {
  return (
    <svg {...shared} className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function DrawingsIcon() {
  return (
    <svg {...shared} className="h-5 w-5" aria-hidden="true">
      <path d="M6 3h9l4 4v14H6V3Z" />
      <path d="M14 3v5h5M9 12h6M9 16h6" />
    </svg>
  );
}

export function ProductionIcon() {
  return (
    <svg {...shared} className="h-5 w-5" aria-hidden="true">
      <path d="M4 19V9m6 10V5m6 14v-7" />
      <path d="M4 19h16" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg {...shared} className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M2 12h2m16 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg {...shared} className="h-5 w-5" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
  );
}

export function ArrowUpIcon() {
  return (
    <svg {...shared} className="h-5 w-5" aria-hidden="true">
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}
