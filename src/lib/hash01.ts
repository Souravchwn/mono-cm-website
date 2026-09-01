/**
 * Deterministic integer hash → [0, 1).
 *
 * `Math.random()` is banned in this codebase's scene positioning: it hit real
 * server/client hydration mismatches twice (see OrbitalDiagram.tsx's angle
 * rounding), so anything that places or varies geometry must produce the same
 * value on the server and in the browser. Every operation here is spec'd
 * integer / 32-bit bitwise math (`Math.imul`, `>>>`, `^`), which is bit-for-bit
 * identical in both environments.
 *
 * Prefer this over arithmetic patterns like `(i * 7 + seed * 13) % 10` — those
 * are deterministic too, but they're *periodic*, and the repeat is clearly
 * visible once you render a few dozen of them (it's what made both the Hero
 * city's and the footer skyline's window lights read as a repeating pattern
 * rather than a real city).
 */
export function hash01(n: number) {
  let x = Math.imul(n ^ 0x9e3779b9, 2654435761) >>> 0;
  x = (x ^ (x >>> 13)) >>> 0;
  x = Math.imul(x, 2246822519) >>> 0;
  x = (x ^ (x >>> 16)) >>> 0;
  return x / 4294967296;
}
