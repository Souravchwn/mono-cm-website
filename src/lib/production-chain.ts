import { Zap, Package, Users, Truck, Calendar, TrendingUp } from "lucide-react";
import type { OrbitalNode } from "@/components/scenes/OrbitalDiagram";

/**
 * The one production-chain diagram, reused identically across Sections 03, 06,
 * and 07 (right side) — same node set, same component, per the "same visual
 * object recurring" requirement (context/sections/03-cause-effect.md). Content
 * mirrors the exact chip labels already established in Section 02
 * (ProductionEngineSection: "Material −25 m³", "Labor +Production Hours",
 * "Equipment +Pump Usage", "Schedule +Progress", "Cash Flow +Cost") rather than
 * inventing new claims — see design.md → "Orbital diagram replaces the 3D
 * scene" for why this replaced the previous Three.js DiagramScene3D.
 */
export const PRODUCTION_CHAIN: OrbitalNode[] = [
  {
    id: "production",
    label: "Production",
    tier: "source",
    description: "The event that starts every downstream update — a quantity logged against a drawing.",
    icon: Zap,
    relatedIds: ["material", "labor", "equipment"],
  },
  {
    id: "material",
    label: "Material",
    tier: "effect",
    description: "Inventory decreases automatically as material is consumed on site.",
    icon: Package,
    relatedIds: ["production", "schedule"],
  },
  {
    id: "labor",
    label: "Labor",
    tier: "effect",
    description: "Hours and productivity update from the same event — no separate timesheet entry.",
    icon: Users,
    relatedIds: ["production", "schedule"],
  },
  {
    id: "equipment",
    label: "Equipment",
    tier: "effect",
    description: "Utilization and equipment usage track from the same production record.",
    icon: Truck,
    relatedIds: ["production", "schedule"],
  },
  {
    id: "schedule",
    label: "Schedule",
    tier: "effect",
    description: "Progress moves forward the moment production is logged.",
    icon: Calendar,
    relatedIds: ["material", "labor", "equipment", "forecast"],
  },
  {
    id: "forecast",
    label: "Cash Flow → Forecast",
    tier: "outcome",
    description: "Cost, commitments, and forecast recalculate from the same production event.",
    icon: TrendingUp,
    relatedIds: ["schedule"],
  },
];
