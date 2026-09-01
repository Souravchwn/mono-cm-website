"use client";

/**
 * Hero backdrop — a real Three.js camera flythrough, built from 21st.dev's
 * "Horizon Hero Section" source (user pasted it in full, 2026-09-01) and
 * restaged since against photo references the user supplied: a Denver-style
 * skyline with mountains filling the background, and a flat-illustrated
 * colourful cityscape. Full history in design.md → search "flythrough".
 *
 * **The shot:** the camera climbs a mountain, does one full vertical loop at
 * the peak, and comes down the far side **facing back the way it came** — so
 * the closing frame is the city on the plain with the very ridge it just flew
 * over rising behind it.
 *
 * **The geometry is what makes this work, not the rotation.** Two earlier
 * passes got "hills behind the city" wrong by treating it as a rotation
 * problem. It isn't — it's placement:
 *
 *     start ---> [ RIDGE ] ---> [ CITY ] ---> camera ends here, facing back
 *     z=+1200     z≈-140        z=-350          z=-980, faces +z
 *
 * The city sits on the far side of the ridge, between the camera's final
 * position and the ridge. From that vantage the depth order is
 * camera → city → ridge, so the ridge is behind the city by construction.
 *
 * **Rotation is two layers, deliberately split:**
 * - **Yaw** (`0 → π`) does the real work of netting the camera to face back.
 * - **A full 360° pitch loop** (`camera.rotateX`) plays over the same beat as
 *   pure flourish. A full 2π is a no-op, so it can never leave the camera
 *   pointing the wrong way — all load-bearing orientation lives in the yaw.
 *
 * **The terrain is real 3D geometry, not silhouettes.** Every earlier version
 * drew the hills as flat `ShapeGeometry` cut-outs standing in the scene. That
 * was visibly wrong the moment the camera left ground level: they are
 * infinitely thin, so you could see straight through them (the city showed
 * through the "solid" hills), they vanished entirely when viewed edge-on from
 * above during the loop, and their flat bottom edges read as hard rectangular
 * cuts hanging in space. Replaced with a single displaced-heightfield mesh —
 * a subdivided plane whose vertices are pushed up by `terrainHeight()` — which
 * is genuinely solid, occludes correctly from every angle, and reads as one
 * continuous landscape the camera flies over rather than a stack of cardboard.
 * `flatShading` keeps it faceted and low-poly, matching the illustrated
 * buildings rather than aiming at photoreal.
 *
 * **Buildings are flat-illustrated** — unlit `MeshBasicMaterial` (no lighting
 * on them at all; flat colour fields are the point), canvas-drawn arched
 * windows, a dark outline for graphic edge definition, deep jewel tones. Not
 * the reference illustration's literal rainbow: "borrow the technique, not the
 * palette," the rule every community-component adaptation here follows.
 *
 * **Perf** is tiered off viewport width (see `TIER`) — geometry density, star
 * count, pixel ratio, antialias and the bloom pass all scale down on phones,
 * where this is the single heaviest thing on the page and the first paint.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { hash01 } from "@/lib/hash01";

// ---------------------------------------------------------------- perf tiers

/**
 * Chosen once at mount from viewport width. Everything expensive keys off
 * this: terrain subdivision dominates vertex count, stars dominate overdraw,
 * and `UnrealBloomPass` is a multi-pass blur that is genuinely costly at high
 * DPR — on a phone it is the difference between a smooth scrub and a slideshow.
 */
function perfTier() {
  if (typeof window === "undefined") return "desktop" as const;
  const w = window.innerWidth;
  if (w < 640) return "phone" as const;
  if (w < 1024) return "tablet" as const;
  return "desktop" as const;
}

const TIERS = {
  phone: {
    terrainSeg: [72, 54] as [number, number],
    stars: 420,
    buildings: 16,
    cars: 16,
    trees: 30,
    maxDpr: 1.5,
    antialias: false,
    bloom: false,
  },
  tablet: {
    terrainSeg: [110, 80] as [number, number],
    stars: 800,
    buildings: 22,
    cars: 28,
    trees: 58,
    maxDpr: 1.75,
    antialias: true,
    bloom: true,
  },
  desktop: {
    terrainSeg: [170, 120] as [number, number],
    stars: 1400,
    buildings: 30,
    cars: 46,
    trees: 88,
    maxDpr: 2,
    antialias: true,
    bloom: true,
  },
} as const;

// ------------------------------------------------------------------ terrain

const TERRAIN_W = 4200;
const TERRAIN_D = 4200;
const RIDGE_Z = -140;
/**
 * Sized against the *closing* shot, which is the constraint that matters: from
 * the final camera (y≈170, ~1010 out) the summits need to land 8–17° above eye
 * level so the range occupies the upper third with sky above it. At 620 the
 * peak sat past 25°, above the frame edge, and the "mountain" rendered as a
 * featureless wall filling the whole top of the screen with no silhouette.
 */
const PEAK = 430;
// Beyond this the land is exactly flat — the plain the city stands on.
const PLAIN_START = -240;
const PLAIN_FULL = -320;

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Smooth value noise off `hash01` — organic ridge variation without `Math.random`. */
function valueNoise(x: number, z: number) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const u = smoothstep(0, 1, x - xi);
  const v = smoothstep(0, 1, z - zi);
  const n00 = hash01(xi * 374761 + zi * 668265);
  const n10 = hash01((xi + 1) * 374761 + zi * 668265);
  const n01 = hash01(xi * 374761 + (zi + 1) * 668265);
  const n11 = hash01((xi + 1) * 374761 + (zi + 1) * 668265);
  return (n00 * (1 - u) + n10 * u) * (1 - v) + (n01 * (1 - u) + n11 * u) * v;
}

/**
 * Asymmetric ridge: a long gentle approach slope on the camera's starting side
 * and a fast drop on the far side, so the city's plain begins close behind the
 * peak instead of miles away. Multi-octave noise along the ridge line gives it
 * distinct summits rather than one smooth hump.
 */
function terrainHeight(x: number, z: number) {
  const dz = z > RIDGE_Z ? (z - RIDGE_Z) / 560 : (z - RIDGE_Z) / 165;
  const ridge = Math.exp(-dz * dz * (z > RIDGE_Z ? 1.35 : 2.1));

  // High floor (0.72) on purpose. With a low floor the summit noise can bottom
  // out near the middle of the range, and since the closing shot looks at the
  // ridge head-on around x≈0, that left the "background mountain" as a low bump
  // barely above the horizon — confirmed live. A high floor guarantees the
  // range reads as dominant from every angle; the noise then only decides how
  // *much* taller each summit is, not whether there is one.
  const summits =
    0.72 +
    0.28 * valueNoise(x / 460 + 3.1, 0.5) +
    0.12 * valueNoise(x / 180 + 11.7, 1.5);
  const detail = (valueNoise(x / 95, z / 95) - 0.5) * 0.28;

  let h = PEAK * ridge * (summits + detail * ridge);

  // Foothills on the approach so the near ground isn't a dead flat sheet.
  h += 46 * Math.max(0, 1 - Math.abs(z - 620) / 900) * valueNoise(x / 260 + 7, z / 260 + 2);

  // Flatten completely across the city plain.
  h *= 1 - smoothstep(PLAIN_START, PLAIN_FULL, z);
  return Math.max(h, 0);
}

// Height-banded terrain palette: dark teal valleys → slate flanks → alpenglow
// peaks. Lighter with altitude, which is what lets the ridge read as the
// *background* subject against a night sky in the closing frame (it was
// near-black before and disappeared entirely).
// Deliberately light. Real distant ranges are *lighter* than the foreground —
// atmospheric perspective — and that is what the Denver reference shows: the
// mountains are the brightest thing in frame and the city is the dark mass
// against them. The first palette was near-black, which worked while the ridge
// was only ever a foreground silhouette but made it vanish against the night
// sky once the camera turned and it became the background subject.
const TERRAIN_LOW = new THREE.Color(0x24384a);
const TERRAIN_MID = new THREE.Color(0x4c6180);
const TERRAIN_HIGH = new THREE.Color(0x8090b4);
const TERRAIN_PEAK = new THREE.Color(0xf0cfdc);

function terrainColor(h: number, out: THREE.Color) {
  if (h < PEAK * 0.3) return out.copy(TERRAIN_LOW).lerp(TERRAIN_MID, smoothstep(0, PEAK * 0.3, h));
  if (h < PEAK * 0.58) return out.copy(TERRAIN_MID).lerp(TERRAIN_HIGH, smoothstep(PEAK * 0.3, PEAK * 0.58, h));
  // Wide alpenglow band — a narrow one put the light on a sliver too thin to
  // register at the distance the closing shot views the ridge from.
  return out.copy(TERRAIN_HIGH).lerp(TERRAIN_PEAK, smoothstep(PEAK * 0.58, PEAK * 0.98, h));
}

// ------------------------------------------------------------------- camera

// `pitch` is the look-ahead tilt (positive = up), lerped with position.
const CAMERA_STOPS = [
  // Far enough back that a ridge this size reads as a distant horizon with
  // starfield above it, not a wall filling the viewport.
  { at: 0, pos: new THREE.Vector3(0, 40, 1200), pitch: 0.05 },
  { at: 0.22, pos: new THREE.Vector3(0, 250, 520), pitch: 0.02 },
  // Apex — must clear the tallest summits, which reach PEAK * 1.12 ≈ 480.
  // Steep downward pitch: the terrain is real 3D, so looking down shows
  // landscape rather than the empty sky the old flat silhouettes gave.
  { at: 0.42, pos: new THREE.Vector3(0, 660, -70), pitch: -1.5 },
  // Descending the far side — loop and turn play out here, over real geometry.
  { at: 0.55, pos: new THREE.Vector3(0, 420, -330), pitch: -0.85 },
  // Clear of the city's near edge (its bands span z −790..−410). This has to
  // land *past* −790, not mid-city: the camera is flying backwards — moving −z
  // while facing +z — so at z=−500 three of the four building bands sat behind
  // it and the frame went nearly empty for a stretch. From here the whole
  // skyline is ahead. The 0.55→0.7 leg crosses the city at 420→240, both well
  // above the tallest tower at 215, so it passes over the rooftops cleanly.
  { at: 0.7, pos: new THREE.Vector3(0, 240, -830), pitch: -0.2 },
  // Close on the city.
  { at: 0.85, pos: new THREE.Vector3(0, 150, -960), pitch: -0.08 },
  // Final wide shot. Pulled much further back (was z −990) after checking it
  // live: at ~850 units the ridge subtended ~26° above view centre, right at
  // the top edge of a 60° frame, so it was effectively cropped out and the
  // closing composition lost its background entirely. At this distance it sits
  // ~16° up — comfortably in the upper third, city below it — and picks up
  // some genuine atmospheric haze, which is what the reference photo shows.
  { at: 1, pos: new THREE.Vector3(0, 170, -1150), pitch: -0.02 },
];
const LOOP_WINDOW: [number, number] = [0.44, 0.58];
const YAW_WINDOW: [number, number] = [0.5, 0.68];

function cameraAt(progress: number) {
  let a = CAMERA_STOPS[0];
  let b = CAMERA_STOPS[CAMERA_STOPS.length - 1];
  for (let i = 0; i < CAMERA_STOPS.length - 1; i++) {
    if (progress >= CAMERA_STOPS[i].at && progress <= CAMERA_STOPS[i + 1].at) {
      a = CAMERA_STOPS[i];
      b = CAMERA_STOPS[i + 1];
      break;
    }
  }
  const span = b.at - a.at || 1;
  const t = Math.min(1, Math.max(0, (progress - a.at) / span));
  return {
    pos: a.pos.clone().lerp(b.pos, t),
    pitch: THREE.MathUtils.lerp(a.pitch, b.pitch, t),
  };
}

// --------------------------------------------------------------------- city

/**
 * Moved forward from -350: at that depth the city sat 800 out from the closing
 * camera and only ~210 in front of the ridge, so it read small and the two
 * planes crowded each other. At -600 it is 550 out (noticeably larger) and 460
 * clear of the ridge, which is what gives the closing frame its city-in-front /
 * mountains-behind separation.
 */
const CITY_Z = -600;
const BODY_PALETTE = [0x18342f, 0x1c2c46, 0x2a2140, 0x1f3d33, 0x2f2418, 0x1a3040];
const LIT_ACCENTS = [0x34d399, 0x67e8f9, 0xe8c07d];
const BUILDING_BANDS = [-190, -60, 60, 190];
const ROADS_ALONG_X = [-125, 0, 125];
const ROADS_ALONG_Z = [-320, -160, 0, 160, 320];

function buildingSpecs(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    x: -430 + i * (860 / (count - 1)) + (hash01(i * 5 + 9) - 0.5) * 30,
    z: BUILDING_BANDS[i % BUILDING_BANDS.length] + (hash01(i * 7 + 4) - 0.5) * 40,
    w: 12 + hash01(i * 3 + 1) * 22,
    h: 45 + hash01(i * 3 + 2) * 170,
    bodyColor: BODY_PALETTE[Math.floor(hash01(i * 11 + 2) * BODY_PALETTE.length)],
    accent: LIT_ACCENTS[Math.floor(hash01(i * 13 + 6) * LIT_ACCENTS.length)],
    // Sparse rooftop lights — a real skyline is mostly dark mass with a few lit
    // towers; scarcity sells "lit," not coverage.
    beacon: hash01(i * 17 + 3) < 0.3,
    round: hash01(i * 19 + 8) < 0.18,
  }));
}

/**
 * Arched-window canvas texture, drawn once per building — a few dozen cheap
 * one-time 2D draws versus the hundreds of extra meshes per-window geometry
 * would cost. Lit/unlit *and* per-window brightness both come from `hash01`:
 * the earlier `% 10` pattern was deterministic but periodic, and the repeat was
 * plainly visible as regular stripes across the skyline.
 */
function createBuildingTexture(bodyColor: number, accent: number, seed: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const body = new THREE.Color(bodyColor);
  ctx.fillStyle = `#${body.getHexString()}`;
  ctx.fillRect(0, 0, 128, 256);

  const dim = body.clone().multiplyScalar(0.55);
  const bright = new THREE.Color(accent);
  const cols = 4;
  const rows = 9;
  const cw = 128 / cols;
  const rh = 256 / rows;

  function archPath(x: number, y: number, w: number, h: number) {
    const r = w / 2;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, 0, false);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = r * cols + c;
      const lit = hash01(seed * 977 + cell * 31) < 0.45;
      ctx.fillStyle = `#${(lit ? bright : dim).getHexString()}`;
      ctx.globalAlpha = lit ? 0.55 + hash01(seed * 613 + cell * 47) * 0.45 : 0.9;
      const pad = Math.min(cw, rh) * 0.16;
      archPath(c * cw + pad, r * rh + pad, cw - pad * 2, rh - pad * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// ---------------------------------------------------------------- component

export function HorizonFlythroughScene({
  progressRef,
  reducedMotion,
}: {
  /** Read every frame; `.value` is driven 0→1 by HeroSection's own scroll timeline. */
  progressRef: React.RefObject<{ value: number }>;
  reducedMotion: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tier = TIERS[perfTier()];
    const container = canvas.parentElement!;
    const disposables: { dispose(): void }[] = [];
    const track = <T extends { dispose(): void }>(o: T) => (disposables.push(o), o);

    const scene = new THREE.Scene();
    // Light fog only — heavy fog was most of why the ridge washed to black at
    // the distance it sits from the closing camera position.
    // Haze colour is a mid slate-blue, not near-black: fog is what sells
    // distance, and it can only do that by pulling far geometry *toward* a
    // lighter value than the sky behind it. The starfield sets `fog: false`
    // and the sky is a CSS layer behind a transparent canvas, so neither is
    // affected by this.
    scene.fog = new THREE.FogExp2(0x1e2a40, 0.00034);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 6000);
    camera.position.copy(CAMERA_STOPS[0].pos);
    camera.lookAt(0, 40, -400);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: tier.antialias, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier.maxDpr));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    if (tier.bloom) {
      // Conservative strength — a soft, considered glow is on-brand; a
      // neon-bright one reads as gaming UI, not premium SaaS (design.md).
      composer.addPass(
        new UnrealBloomPass(new THREE.Vector2(container.clientWidth, container.clientHeight), 0.35, 0.4, 0.88),
      );
    }

    // Lights exist for the terrain only — every other material here is unlit
    // on purpose (flat illustrated colour fields).
    //
    // Two directional lights, from opposite sides in z, and that is the whole
    // point. The camera crosses the ridge and looks back at it, so it sees the
    // near face on the way out and the *far* face at the end. With a single
    // light (from +z) the far face received nothing but ambient and rendered
    // as flat black — the closing composition lost its background entirely
    // even though the geometry was right there, 631 units tall and well inside
    // the frustum. `fill` lights that far face; ambient is high because this is
    // a stylised night scene where nothing should ever fall to pure black.
    // Ambient is the floor that stops either face going black; the two
    // directionals do the shaping. Ambient deliberately well below them —
    // pushed high enough to guarantee visibility it flattens the facets into
    // one uniform blue field and the ridge stops reading as a ridge.
    scene.add(new THREE.AmbientLight(0x6b7f9c, 1.15));
    const moon = new THREE.DirectionalLight(0xd6e6f5, 1.7);
    moon.position.set(-600, 900, 400);
    scene.add(moon);
    const fill = new THREE.DirectionalLight(0x9dbfe0, 1.25);
    fill.position.set(400, 700, -900);
    scene.add(fill);

    // ------------------------------------------------------------- starfield
    const starGeo = track(new THREE.BufferGeometry());
    const starPos = new Float32Array(tier.stars * 3);
    const starColor = new Float32Array(tier.stars * 3);
    const starSize = new Float32Array(tier.stars);
    const tmp = new THREE.Color();
    for (let i = 0; i < tier.stars; i++) {
      const radius = 1400 + hash01(i * 3 + 1) * 2200;
      const theta = hash01(i * 5 + 2) * Math.PI * 2;
      const phi = Math.acos(hash01(i * 7 + 3) * 2 - 1);
      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = Math.abs(radius * Math.sin(phi) * Math.sin(theta)) * 0.55 + 260;
      starPos[i * 3 + 2] = radius * Math.cos(phi);
      const mix = hash01(i * 11 + 5);
      if (mix < 0.6) tmp.setHSL(0, 0, 0.85);
      else if (mix < 0.8) tmp.setHSL(0.42, 0.6, 0.7);
      else tmp.setHSL(0.5, 0.6, 0.7);
      starColor[i * 3] = tmp.r;
      starColor[i * 3 + 1] = tmp.g;
      starColor[i * 3 + 2] = tmp.b;
      starSize[i] = 1 + hash01(i * 13 + 7) * 1.8;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColor, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(starSize, 1));
    const starMat = track(
      new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          attribute float size; attribute vec3 color;
          varying vec3 vColor; uniform float time;
          void main() {
            vColor = color;
            vec3 pos = position;
            float a = time * 0.003;
            mat2 rot = mat2(cos(a), -sin(a), sin(a), cos(a));
            pos.xz = rot * pos.xz;
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (520.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if (d > 0.5) discard;
            gl_FragColor = vec4(vColor, 1.0 - smoothstep(0.0, 0.5, d));
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    );
    scene.add(new THREE.Points(starGeo, starMat));

    // ----------------------------------------------------------- horizon glow
    const glowMat = track(
      new THREE.ShaderMaterial({
        uniforms: { color: { value: new THREE.Color(0x2fd9a8) } },
        vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `
          uniform vec3 color; varying vec2 vUv;
          void main(){
            float d = length(vUv - 0.5) * 2.0;
            gl_FragColor = vec4(color, smoothstep(1.0, 0.0, d) * 0.32);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    );
    const glow = new THREE.Mesh(track(new THREE.PlaneGeometry(900, 900)), glowMat);
    glow.position.set(0, 300, -520);
    scene.add(glow);

    // ---------------------------------------------------------------- terrain
    // One displaced heightfield — genuinely solid, unlike the flat silhouette
    // cut-outs this replaces (see the header note).
    const [wSeg, dSeg] = tier.terrainSeg;
    const terrainGeo = track(new THREE.PlaneGeometry(TERRAIN_W, TERRAIN_D, wSeg, dSeg));
    {
      const pos = terrainGeo.attributes.position;
      const colors = new Float32Array(pos.count * 3);
      const c = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        // Plane is authored in XY then rotated flat, so local Y maps to world
        // -Z and local Z becomes world height.
        const wx = pos.getX(i);
        const wz = -pos.getY(i);
        const h = terrainHeight(wx, wz);
        pos.setZ(i, h);
        terrainColor(h, c);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
      terrainGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      terrainGeo.rotateX(-Math.PI / 2);
      terrainGeo.computeVertexNormals();
      // Explicit, because the positions were rewritten after construction —
      // never leave a displaced mesh relying on bounds derived from its
      // original flat state, or frustum culling can drop it at some angles.
      terrainGeo.computeBoundingSphere();
    }
    const terrainMat = track(
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.95,
        metalness: 0,
        flatShading: true,
      }),
    );
    scene.add(new THREE.Mesh(terrainGeo, terrainMat));

    // ------------------------------------------------------------------- city
    const cityGroup = new THREE.Group();
    cityGroup.position.set(0, 0, CITY_Z);

    const roadMat = track(new THREE.MeshBasicMaterial({ color: 0x1b2521 }));
    const roadAlongX = track(new THREE.PlaneGeometry(1150, 20));
    const roadAlongZ = track(new THREE.PlaneGeometry(18, 560));
    ROADS_ALONG_X.forEach((z) => {
      const road = new THREE.Mesh(roadAlongX, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, 0.6, z);
      cityGroup.add(road);
    });
    ROADS_ALONG_Z.forEach((x) => {
      const road = new THREE.Mesh(roadAlongZ, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, 0.6, 0);
      cityGroup.add(road);
    });

    // Cars — one instanced draw call, per-instance colour so they read as a
    // mix of headlights and taillights at this distance.
    const carGeo = track(new THREE.BoxGeometry(5, 2.4, 2.6));
    const carMat = track(new THREE.MeshBasicMaterial());
    const cars = new THREE.InstancedMesh(carGeo, carMat, tier.cars);
    const dummy = new THREE.Object3D();
    const warm = new THREE.Color(0xe8c07d);
    const cool = new THREE.Color(0xdff5ff);
    for (let i = 0; i < tier.cars; i++) {
      if (hash01(i * 23 + 1) < 0.6) {
        const z = ROADS_ALONG_X[Math.floor(hash01(i * 29 + 2) * ROADS_ALONG_X.length)];
        dummy.position.set(-560 + hash01(i * 31 + 3) * 1120, 1.8, z + (hash01(i * 37 + 4) - 0.5) * 9);
        dummy.rotation.set(0, 0, 0);
      } else {
        const x = ROADS_ALONG_Z[Math.floor(hash01(i * 41 + 5) * ROADS_ALONG_Z.length)];
        dummy.position.set(x + (hash01(i * 43 + 6) - 0.5) * 8, 1.8, -270 + hash01(i * 47 + 7) * 540);
        dummy.rotation.set(0, Math.PI / 2, 0);
      }
      dummy.scale.setScalar(0.85 + hash01(i * 53 + 8) * 0.5);
      dummy.updateMatrix();
      cars.setMatrixAt(i, dummy.matrix);
      cars.setColorAt(i, hash01(i * 59 + 9) < 0.5 ? warm : cool);
    }
    cars.instanceMatrix.needsUpdate = true;
    if (cars.instanceColor) cars.instanceColor.needsUpdate = true;
    cityGroup.add(cars);

    // Trees. Two populations, because "trees in front of the buildings, big and
    // small" needs both a foreground belt and street planting — a single evenly
    // scattered set gives neither.
    //
    // The front belt sits at local z −320..−200, i.e. ahead of the nearest
    // building band (−190), and is where the genuinely big ones go. Its depth
    // is picked against what the closing camera can actually see: from y≈175
    // the ground only enters frame beyond ~300 units out, so a belt any nearer
    // would sit entirely below the bottom edge. At this depth the tallest read
    // around 40 units and frame the skyline; a few clipping the bottom edge is
    // wanted, not a bug — that is what sells foreground depth.
    const treeGeo = track(new THREE.ConeGeometry(3.2, 10, 6));
    const treeMat = track(new THREE.MeshBasicMaterial());
    const trees = new THREE.InstancedMesh(treeGeo, treeMat, tier.trees);
    const canopyDark = new THREE.Color(0x14301f);
    const canopyLit = new THREE.Color(0x2f6446);
    const tmpCanopy = new THREE.Color();
    for (let i = 0; i < tier.trees; i++) {
      const isFront = hash01(i * 91 + 3) < 0.42;
      let scale: number;
      let x: number;
      let z: number;
      if (isFront) {
        x = -640 + hash01(i * 71 + 3) * 1280;
        z = -310 + hash01(i * 83 + 6) * 160;
        // Big, and widely varied — a belt of uniformly large trees reads as a
        // fence rather than woodland.
        scale = 2.6 + hash01(i * 79 + 5) * 3.4;
      } else {
        const road = ROADS_ALONG_X[Math.floor(hash01(i * 61 + 1) * ROADS_ALONG_X.length)];
        const side = hash01(i * 67 + 2) < 0.5 ? -1 : 1;
        x = -560 + hash01(i * 71 + 3) * 1120;
        z = road + side * (16 + hash01(i * 73 + 4) * 10);
        scale = 0.65 + hash01(i * 79 + 5) * 1.05;
      }
      // y must scale with the tree. ConeGeometry is centred on its origin, so a
      // fixed y=5 only sits a scale-1 cone on the ground — anything larger sank
      // into it (a scale-4 tree was buried 15 units and rendered as a stub).
      dummy.position.set(x, 5 * scale, z);
      dummy.scale.setScalar(scale);
      dummy.rotation.set(0, hash01(i * 97 + 8) * Math.PI, 0);
      dummy.updateMatrix();
      trees.setMatrixAt(i, dummy.matrix);
      trees.setColorAt(i, tmpCanopy.copy(canopyDark).lerp(canopyLit, hash01(i * 103 + 9)));
    }
    trees.instanceMatrix.needsUpdate = true;
    if (trees.instanceColor) trees.instanceColor.needsUpdate = true;
    cityGroup.add(trees);

    const beaconMeshes: THREE.Mesh[] = [];
    const beaconGeo = track(new THREE.SphereGeometry(2.4, 8, 8));
    buildingSpecs(tier.buildings).forEach((b, i) => {
      const geo = track(
        b.round
          ? new THREE.CylinderGeometry(b.w * 0.55, b.w * 0.6, b.h, 10)
          : new THREE.BoxGeometry(b.w, b.h, b.w),
      );

      const texture = track(createBuildingTexture(b.bodyColor, b.accent, i));
      texture.repeat.set(b.round ? 2 : 1, Math.max(1, Math.round(b.h / 44)));
      const sideMat = track(new THREE.MeshBasicMaterial({ map: texture }));
      // Roofs get their own flat material. Applying the window texture to all
      // six faces stretched a row of arched windows across the top of every
      // building — visible as soon as the camera rose above them, and the main
      // thing that made the tops look broken.
      const roofMat = track(
        new THREE.MeshBasicMaterial({ color: new THREE.Color(b.bodyColor).multiplyScalar(1.45) }),
      );
      // BoxGeometry group order is +X,-X,+Y,-Y,+Z,-Z; CylinderGeometry is
      // side,top,bottom.
      const materials = b.round
        ? [sideMat, roofMat, roofMat]
        : [sideMat, sideMat, roofMat, roofMat, sideMat, sideMat];

      const mesh = new THREE.Mesh(geo, materials);
      mesh.position.set(b.x, b.h / 2, b.z);
      cityGroup.add(mesh);

      const outline = new THREE.LineSegments(
        track(new THREE.EdgesGeometry(geo)),
        track(new THREE.LineBasicMaterial({ color: 0x05070a, transparent: true, opacity: 0.5 })),
      );
      outline.position.copy(mesh.position);
      cityGroup.add(outline);

      if (b.beacon) {
        const beacon = new THREE.Mesh(
          beaconGeo,
          track(new THREE.MeshBasicMaterial({ color: b.accent, transparent: true, opacity: 0 })),
        );
        beacon.position.set(b.x, b.h + 3, b.z);
        cityGroup.add(beacon);
        beaconMeshes.push(beacon);
      }
    });

    scene.add(cityGroup);

    // ------------------------------------------------------------------ loop
    let raf = 0;
    let time = 0;
    const _forward = new THREE.Vector3();
    const _target = new THREE.Vector3();

    function applyProgress(progress: number) {
      const { pos, pitch } = cameraAt(progress);
      camera.position.copy(pos);

      // Yaw does the real orientation work: 0 = facing out (−z, at the ridge),
      // π = facing back (+z, at the city with the ridge behind it).
      const yaw = Math.PI * smoothstep(YAW_WINDOW[0], YAW_WINDOW[1], progress);
      _forward.set(Math.sin(yaw), pitch, -Math.cos(yaw)).normalize();
      _target.copy(camera.position).addScaledVector(_forward, 400);
      camera.lookAt(_target);

      // The loop, layered on top — a full 2π nets to a no-op, so it can never
      // leave the camera pointing the wrong way.
      camera.rotateX(Math.PI * 2 * smoothstep(LOOP_WINDOW[0], LOOP_WINDOW[1], progress));

      const reveal = smoothstep(0.55, 0.82, progress);
      for (const beacon of beaconMeshes) {
        (beacon.material as THREE.MeshBasicMaterial).opacity = reveal;
      }
    }

    function render() {
      time += 1;
      starMat.uniforms.time.value = time * 0.05;
      applyProgress(progressRef.current?.value ?? 0);
      composer.render();
      if (!reducedMotion) raf = requestAnimationFrame(render);
    }

    if (reducedMotion) {
      // Storyboard's reduced-motion rule: render the SCROLL 100% end-state
      // once, no animation loop at all.
      applyProgress(1);
      composer.render();
    } else {
      raf = requestAnimationFrame(render);
    }

    function handleResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      for (const d of disposables) d.dispose();
      composer.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- progressRef is a stable ref container
  }, [reducedMotion]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #05060a 0%, #070c10 55%, #05060a 100%)" }} />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/*
        Left-side scrim. The ridge has to be bright to read against the night
        sky, which costs contrast under the Hero's left-aligned copy; darkening
        the terrain again would just undo that, so the copy gets its own ground
        instead and the right of the frame — where the city and peaks are —
        stays unobscured.
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,6,10,0.92) 0%, rgba(5,6,10,0.78) 34%, rgba(5,6,10,0.3) 58%, transparent 78%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: "linear-gradient(180deg, transparent, #05060a 88%)" }}
      />
    </div>
  );
}
