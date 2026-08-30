/**
 * Shared 3D cause-and-effect diagram config — reused by Sections 03, 06, and 07
 * (right side) so they render the exact same node positions/shapes through the
 * same DiagramScene3D component, per context/sections/03-cause-effect.md's "same
 * visual object recurring" requirement. See context/tech-notes.md "3D pipeline".
 */
export type DiagramAccent = "emerald" | "cyan" | "bright";

export type DiagramNode3D = {
  id: string;
  label: string;
  position: [number, number, number];
  accent: DiagramAccent;
};

export const DIAGRAM_EDGES: [string, string][] = [
  ["production", "material"],
  ["production", "labor"],
  ["production", "equipment"],
  ["material", "schedule"],
  ["labor", "schedule"],
  ["equipment", "schedule"],
  ["schedule", "forecast"],
];

// x-spread is deliberately conservative (not ±2.3+) — drei's <Html> wrapper
// clips at the canvas edge, and this diagram renders inside a narrow
// max-w-sm/md container (mobile-friendly, matching the old 2D layout's width).
// Wider spread plus this camera's FOV pushed Material/Equipment's labels far
// enough toward the edge that the clip cut them mid-word. Verify in-browser
// (not just visually estimated) before widening this again.
export const CAUSE_EFFECT_NODES: DiagramNode3D[] = [
  { id: "production", label: "Production", position: [0, 2.0, 0], accent: "emerald" },
  { id: "material", label: "Material", position: [-1.7, 0.8, 0.6], accent: "cyan" },
  { id: "labor", label: "Labor", position: [0, 0.8, -0.6], accent: "cyan" },
  { id: "equipment", label: "Equipment", position: [1.7, 0.8, 0.6], accent: "cyan" },
  { id: "schedule", label: "Schedule", position: [0, -0.5, 0], accent: "emerald" },
  { id: "forecast", label: "Cash Flow → Forecast", position: [0, -1.8, 0], accent: "bright" },
];

export const BUSINESS_OUTCOME_NODES: DiagramNode3D[] = [
  { id: "production", label: "Production", position: [0, 2.0, 0], accent: "emerald" },
  { id: "material", label: "Material consumption", position: [-1.7, 0.8, 0.6], accent: "cyan" },
  { id: "labor", label: "Labor cost", position: [0, 0.8, -0.6], accent: "cyan" },
  { id: "equipment", label: "Equipment utilization", position: [1.7, 0.8, 0.6], accent: "cyan" },
  { id: "schedule", label: "Schedule progress", position: [0, -0.5, 0], accent: "emerald" },
  { id: "forecast", label: "Cash-flow forecast", position: [0, -1.8, 0], accent: "bright" },
];

export type Opacity = { value: number };

export type DiagramState = {
  nodes: Record<string, Opacity>;
  edges: Record<string, Opacity>;
};

/** One fresh state object per scene instance — see BuildingScene3D for why. */
export function createDiagramState(nodes: DiagramNode3D[]): DiagramState {
  const nodeState: Record<string, Opacity> = {};
  nodes.forEach((n) => (nodeState[n.id] = { value: 0 }));
  const edgeState: Record<string, Opacity> = {};
  DIAGRAM_EDGES.forEach(([a, b]) => (edgeState[`${a}-${b}`] = { value: 0 }));
  return { nodes: nodeState, edges: edgeState };
}

/** Sets every node/edge opacity to 1 — used where the diagram isn't scroll-scrubbed
 * (Sections 06, 07) and should just render fully resolved. */
export function resolveDiagramState(state: DiagramState) {
  Object.values(state.nodes).forEach((o) => (o.value = 1));
  Object.values(state.edges).forEach((o) => (o.value = 1));
}
