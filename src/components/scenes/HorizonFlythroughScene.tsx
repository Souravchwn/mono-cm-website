"use client";

/**
 * Hero backdrop — a real Three.js camera flythrough, built from 21st.dev's
 * "Horizon Hero Section" source (user pasted it in full, 2026-09-01) and
 * restaged since against photo references the user supplied: a Denver-style
 * skyline with mountains filling the background, and a flat-illustrated
 * colorful cityscape. Full history in design.md → search "flythrough".
 *
 * **The shot:** the camera climbs a mountain, does one full vertical loop at
 * the peak ("360 in the upper direction"), and comes down the far side
 * **facing back the way it came** — so the closing frame is the city on the
 * plain with the very mountain it just flew over rising behind it.
 *
 * **The geometry is what makes this work, not the rotation.** Two earlier
 * passes got "hills behind the city" wrong, both times by treating it as a
 * rotation problem. It isn't — it's placement:
 *
 *     start ---> [ MOUNTAIN ] ---> [ CITY ] ---> camera ends here, facing back
 *     z=+220      z=-60..-210      z=-350          z=-620, faces +z
 *
 * The city sits on the *far* side of the mountain, between the camera's final
 * position and the mountain. From the final vantage the depth order is
 * camera → city → mountain, so the mountain is behind the city by construction.
 * Get that placement right and the rotation is free to be whatever looks best;
 * get it wrong and no amount of camera work saves it.
 *
 * **Rotation is two layers, deliberately split:**
 * - **Yaw** sweeps `0 → π` across the crest, which is what actually nets the
 *   camera to facing back (+z). This does the real work.
 * - **A full 360° pitch loop** (`camera.rotateX`) plays over the same beat as
 *   pure flourish. Because a full 2π is a no-op, it can never leave the camera
 *   pointing the wrong way — all the load-bearing orientation lives in the yaw.
 * The two are staggered slightly (loop leads, yaw settles after) so it reads as
 * "tumble over the top, then settle looking back," not one chaotic spin.
 *
 * **One progress value (0→1)** off this section's existing pinned
 * ScrollTrigger — `HeroSection` tweens a plain `{ value: 0..1 }` proxy object
 * on its own timeline (the same trick `WaitlistSection` uses for
 * `BuildingScene3D`'s material intensities); this reads `.value` each frame.
 *
 * **Buildings are flat-illustrated, not photoreal glass towers** — unlit
 * `MeshBasicMaterial` (no lighting rig at all; flat color fields are the
 * point), canvas-drawn arched windows, a dark outline on every building for
 * graphic edge definition, in a curated palette of deep jewel tones. Not the
 * reference illustration's literal rainbow: this site's system is
 * dark/premium/emerald-cyan, and "borrow the technique, not the palette" is
 * the rule every other community-component adaptation here follows.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { hash01 } from "@/lib/hash01";

const STAR_COUNT = 1400;

const CITY_Z = -350;

/**
 * The single mountain — climbed on the way out, the background subject on the
 * way back. It has to be genuinely big to hold up as a backdrop: from the
 * final camera position the skyline subtends roughly 0.17 of the frame height
 * and the peaks subtend ~0.7, which is what makes it *loom* behind the city
 * rather than peek over it. `glow` is the alpenglow weight — the far peaks
 * catch dusk-pink light while the near foothills stay dark, exactly as in the
 * reference photo.
 */
// Colours run *lighter* with distance, not darker — atmospheric perspective,
// and the same relationship the Denver reference has (the range behind the
// city is the brightest thing in frame; the city itself is the dark mass).
// The first pass had these near-black, which was fine while the mountain was
// only ever a foreground silhouette but made it disappear entirely against
// the night sky once it became the background subject.
const MOUNTAIN_LAYERS = [
  { baseZ: -60, height: 170, color: 0x22392f, rim: 0x3f9c78, glow: 0 },
  { baseZ: -110, height: 230, color: 0x2a4149, rim: 0x357f63, glow: 0.22 },
  { baseZ: -160, height: 290, color: 0x374863, rim: 0x466f9c, glow: 0.48 },
  { baseZ: -210, height: 350, color: 0x455177, rim: 0x6d7fb5, glow: 0.78 },
];
const PEAK_COLOR = new THREE.Color(0xe8c4d2);

// Camera stops. `pitch` is the look-ahead tilt (positive = up), lerped along
// with position — steep down at the crest as the camera goes over the top,
// gentle down at the end looking across the city.
const CAMERA_STOPS = [
  // Start far enough back that a mountain this size reads as a distant
  // horizon ridge with sky above it — at the original z=220 the peaks filled
  // the entire viewport, losing the starfield the opening beat depends on.
  { at: 0, pos: new THREE.Vector3(0, 25, 1200), pitch: 0.06 },
  { at: 0.22, pos: new THREE.Vector3(0, 260, 500), pitch: 0.02 },
  // Apex — just clears the tallest ridge (peaks reach layer.height*1.7 minus
  // the -20 mesh offset, ~575 for the 350-unit layer). Steep pitch: the
  // mountain layers are flat vertical silhouettes, so from directly above they
  // are edge-on and invisible — looking steeply *down and forward* puts the
  // city (real 3D boxes) in frame instead of empty sky.
  { at: 0.42, pos: new THREE.Vector3(0, 620, -60), pitch: -1.8 },
  // Descending the far side — the loop and turn play out here rather than at
  // the apex, precisely because there's something to look at down here.
  { at: 0.55, pos: new THREE.Vector3(0, 380, -320), pitch: -0.9 },
  { at: 0.7, pos: new THREE.Vector3(0, 180, -560), pitch: -0.3 },
  // The city occupies z −540..−160 (its bands are 380 deep), so the last two
  // stops sit well *past* −540 or the camera ends up inside the skyline
  // instead of looking at it.
  { at: 0.85, pos: new THREE.Vector3(0, 110, -760), pitch: -0.08 },
  // Final wide shot: city in front, mountain behind it.
  { at: 1, pos: new THREE.Vector3(0, 200, -980), pitch: -0.1 },
];
// Staggered on purpose — see the header note on splitting loop from yaw.
const LOOP_WINDOW: [number, number] = [0.44, 0.58];
const YAW_WINDOW: [number, number] = [0.5, 0.68];

// Deep jewel tones — flat, illustrated, but still in this site's dark range.
const BODY_PALETTE = [0x18342f, 0x1c2c46, 0x2a2140, 0x1f3d33, 0x2f2418, 0x1a3040];
const LIT_ACCENTS = [0x34d399, 0x67e8f9, 0xe8c07d];

// Four z-bands so buildings form blocks between the roads rather than one row.
const BUILDING_BANDS = [-190, -60, 60, 190];

const BUILDING_COUNT = 30;
const BUILDINGS = Array.from({ length: BUILDING_COUNT }, (_, i) => ({
  x: -430 + i * (860 / (BUILDING_COUNT - 1)) + (hash01(i * 5 + 9) - 0.5) * 30,
  z: BUILDING_BANDS[i % BUILDING_BANDS.length] + (hash01(i * 7 + 4) - 0.5) * 40,
  w: 12 + hash01(i * 3 + 1) * 22,
  h: 45 + hash01(i * 3 + 2) * 170,
  bodyColor: BODY_PALETTE[Math.floor(hash01(i * 11 + 2) * BODY_PALETTE.length)],
  accent: LIT_ACCENTS[Math.floor(hash01(i * 13 + 6) * LIT_ACCENTS.length)],
  // Sparse rooftop lights — a real skyline is mostly dark mass with a few lit
  // towers; scarcity is what sells "lit," not coverage.
  beacon: hash01(i * 17 + 3) < 0.3,
  round: hash01(i * 19 + 8) < 0.18,
}));

const ROADS_ALONG_X = [-125, 0, 125];
const ROADS_ALONG_Z = [-320, -160, 0, 160, 320];

/**
 * Arched-window canvas texture, drawn once per building — 30 cheap one-time 2D
 * draws, versus the hundreds of extra meshes/draw calls per-window geometry
 * would cost. Flat body fill in the building's own palette colour, a grid of
 * rounded-top "arch" shapes (the reference illustration's signature window
 * silhouette, not a plain rectangle), with lit/unlit *and* per-window
 * brightness both chosen by `hash01` — the previous `% 10` pattern was
 * deterministic but periodic, and the repeat was plainly visible.
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
      const roll = hash01(seed * 977 + cell * 31);
      const lit = roll < 0.45;
      ctx.fillStyle = `#${(lit ? bright : dim).getHexString()}`;
      // Lit windows vary in brightness too — uniform brightness is half of why
      // a window grid reads as a texture instead of a building.
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

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

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

    const container = canvas.parentElement!;
    const scene = new THREE.Scene();
    // Light fog only — at 0.0009 the background range was ~44% washed toward
    // black at its viewing distance, which is most of why it vanished.
    scene.fog = new THREE.FogExp2(0x0a0f18, 0.00045);

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 4000);
    camera.position.copy(CAMERA_STOPS[0].pos);
    camera.lookAt(0, 40, -400);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    // Conservative strength — a soft, considered glow is on-brand; a
    // neon-bright one reads as gaming UI, not premium SaaS (design.md).
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(container.clientWidth, container.clientHeight),
      0.35,
      0.4,
      0.88,
    );
    composer.addPass(bloom);

    // Starfield — one field, additive-blended points, emerald/cyan/white mix.
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(STAR_COUNT * 3);
    const starColor = new Float32Array(STAR_COUNT * 3);
    const starSize = new Float32Array(STAR_COUNT);
    const tmpColor = new THREE.Color();
    for (let i = 0; i < STAR_COUNT; i++) {
      const radius = 600 + hash01(i * 3 + 1) * 1400;
      const theta = hash01(i * 5 + 2) * Math.PI * 2;
      const phi = Math.acos(hash01(i * 7 + 3) * 2 - 1);
      starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = Math.abs(radius * Math.sin(phi) * Math.sin(theta)) * 0.6 + 120;
      starPos[i * 3 + 2] = radius * Math.cos(phi);

      const mix = hash01(i * 11 + 5);
      if (mix < 0.6) tmpColor.setHSL(0, 0, 0.85);
      else if (mix < 0.8) tmpColor.setHSL(0.42, 0.6, 0.7);
      else tmpColor.setHSL(0.5, 0.6, 0.7);
      starColor[i * 3] = tmpColor.r;
      starColor[i * 3 + 1] = tmpColor.g;
      starColor[i * 3 + 2] = tmpColor.b;
      starSize[i] = 1 + hash01(i * 13 + 7) * 1.8;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColor, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(starSize, 1));
    const starMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        void main() {
          vColor = color;
          vec3 pos = position;
          float angle = time * 0.003;
          mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
          pos.xz = rot * pos.xz;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (320.0 / -mv.z);
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
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Horizon glow behind the ridge — the "false sun" that gives the mountain
    // silhouette something brighter to read against on the way up.
    const glowMat = new THREE.ShaderMaterial({
      uniforms: { color: { value: new THREE.Color(0x2fd9a8) } },
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        uniform vec3 color; varying vec2 vUv;
        void main() {
          float d = length(vUv - 0.5) * 2.0;
          gl_FragColor = vec4(color, smoothstep(1.0, 0.0, d) * 0.35);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(760, 760), glowMat);
    glow.position.set(0, 380, -260);
    scene.add(glow);

    // The mountain — opaque now (no fade/part animation exists any more, the
    // camera move alone handles what's visible when), so plain depth testing
    // sorts the layers correctly and the transparent-overlap tearing artifact
    // that plagued the earlier version simply can't occur.
    const mountains = MOUNTAIN_LAYERS.map((layer) => {
      const points: THREE.Vector2[] = [];
      const segments = 44;
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments - 0.5) * 1900;
        // Oscillate *around* a high baseline rather than around zero. The
        // first version used a raw `sin * height` ridge, which dipped to
        // deeply negative values — and since the shape is filled from the
        // ridge line down, those dips were see-through gaps that let the city
        // show at scroll 0, when it's supposed to be completely hidden behind
        // the mountain. Baseline 1.25× with ±0.45 swing keeps the lowest
        // saddle at 0.8× the layer height, comfortably taller (in angular
        // terms, from the opening camera position) than the tallest building
        // behind it.
        const wave = Math.sin(i * 0.28 + layer.baseZ) * 0.6 + Math.sin(i * 0.11 + layer.baseZ * 0.7) * 0.4;
        points.push(new THREE.Vector2(x, layer.height * (1.25 + 0.45 * wave)));
      }
      points.push(new THREE.Vector2(950, -400));
      points.push(new THREE.Vector2(-950, -400));
      const geo = new THREE.ShapeGeometry(new THREE.Shape(points));

      // Alpenglow: dark base → pink-lit peaks, weighted per layer so only the
      // far ridges catch the light. Per-vertex colour rather than a second
      // derived silhouette — a filtered/re-closed point list risks a
      // self-intersecting polygon, which is what caused an earlier artifact.
      const base = new THREE.Color(layer.color);
      const peak = base.clone().lerp(PEAK_COLOR, layer.glow);
      const posAttr = geo.attributes.position;
      const colors = new Float32Array(posAttr.count * 3);
      const vc = new THREE.Color();
      for (let i = 0; i < posAttr.count; i++) {
        // Upper third catches the light — enough to read as dusk on snow,
        // not so much that the whole mountain goes pink.
        vc.copy(base).lerp(peak, smoothstep(layer.height * 1.1, layer.height * 1.62, posAttr.getY(i)));
        colors[i * 3] = vc.r;
        colors[i * 3 + 1] = vc.g;
        colors[i * 3 + 2] = vc.b;
      }
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(0, -20, layer.baseZ);

      const rimGeo = new THREE.BufferGeometry().setFromPoints(points.slice(0, segments + 1));
      const rimMat = new THREE.LineBasicMaterial({ color: layer.rim, transparent: true, opacity: 0.55 });
      const rim = new THREE.Line(rimGeo, rimMat);
      rim.position.copy(mesh.position);

      scene.add(mesh);
      scene.add(rim);
      return { mesh, rim };
    });

    // The city — on the far side of the mountain, which is what puts the
    // mountain behind it in the closing frame.
    const cityGroup = new THREE.Group();
    cityGroup.position.set(0, 0, CITY_Z);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(1200, 600),
      new THREE.MeshBasicMaterial({ color: 0x0b1110 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -1, 0);
    cityGroup.add(ground);

    // A real road grid the buildings sit *between*, not two strips beside them.
    const roadMat = new THREE.MeshBasicMaterial({ color: 0x1b2521 });
    ROADS_ALONG_X.forEach((z) => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(1150, 20), roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(0, -0.6, z);
      cityGroup.add(road);
    });
    ROADS_ALONG_Z.forEach((x) => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(18, 560), roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(x, -0.6, 0);
      cityGroup.add(road);
    });

    // Cars — one instanced draw call, per-instance colour so they read as a
    // mix of headlights and taillights at this distance. Static; set dressing.
    const CAR_COUNT = 46;
    const carGeo = new THREE.BoxGeometry(5, 2.4, 2.6);
    const carMat = new THREE.MeshBasicMaterial();
    const cars = new THREE.InstancedMesh(carGeo, carMat, CAR_COUNT);
    const dummy = new THREE.Object3D();
    const warm = new THREE.Color(0xe8c07d);
    const cool = new THREE.Color(0xdff5ff);
    for (let i = 0; i < CAR_COUNT; i++) {
      const onLongRoad = hash01(i * 23 + 1) < 0.6;
      if (onLongRoad) {
        const z = ROADS_ALONG_X[Math.floor(hash01(i * 29 + 2) * ROADS_ALONG_X.length)];
        dummy.position.set(-560 + hash01(i * 31 + 3) * 1120, 1.2, z + (hash01(i * 37 + 4) - 0.5) * 9);
        dummy.rotation.set(0, 0, 0);
      } else {
        const x = ROADS_ALONG_Z[Math.floor(hash01(i * 41 + 5) * ROADS_ALONG_Z.length)];
        dummy.position.set(x + (hash01(i * 43 + 6) - 0.5) * 8, 1.2, -270 + hash01(i * 47 + 7) * 540);
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

    // Trees, scattered along the road grid.
    const TREE_COUNT = 56;
    const treeGeo = new THREE.ConeGeometry(3.2, 10, 6);
    const treeMat = new THREE.MeshBasicMaterial({ color: 0x0e1f16 });
    const trees = new THREE.InstancedMesh(treeGeo, treeMat, TREE_COUNT);
    for (let i = 0; i < TREE_COUNT; i++) {
      const z = ROADS_ALONG_X[Math.floor(hash01(i * 61 + 1) * ROADS_ALONG_X.length)];
      const side = hash01(i * 67 + 2) < 0.5 ? -1 : 1;
      dummy.position.set(-560 + hash01(i * 71 + 3) * 1120, 4, z + side * (16 + hash01(i * 73 + 4) * 10));
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.7 + hash01(i * 79 + 5) * 0.8);
      dummy.updateMatrix();
      trees.setMatrixAt(i, dummy.matrix);
    }
    trees.instanceMatrix.needsUpdate = true;
    cityGroup.add(trees);

    const beaconMeshes: THREE.Mesh[] = [];
    BUILDINGS.forEach((b, i) => {
      const geo = b.round
        ? new THREE.CylinderGeometry(b.w * 0.55, b.w * 0.6, b.h, 10)
        : new THREE.BoxGeometry(b.w, b.h, b.w);

      const texture = createBuildingTexture(b.bodyColor, b.accent, i);
      texture.repeat.set(b.round ? 2 : 1, Math.max(1, Math.round(b.h / 44)));
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: texture }));
      mesh.position.set(b.x, b.h / 2, b.z);
      cityGroup.add(mesh);

      // Graphic outline on every building — the illustrated-poster edge
      // definition the reference has (the sparse rooftop beacons below are the
      // "this one is lit" signal; this is just line art).
      const outline = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0x05070a, transparent: true, opacity: 0.5 }),
      );
      outline.position.copy(mesh.position);
      cityGroup.add(outline);

      if (b.beacon) {
        const beacon = new THREE.Mesh(
          new THREE.SphereGeometry(2.4, 8, 8),
          new THREE.MeshBasicMaterial({ color: b.accent, transparent: true, opacity: 0 }),
        );
        beacon.position.set(b.x, b.h + 3, b.z);
        cityGroup.add(beacon);
        beaconMeshes.push(beacon);
      }
    });

    scene.add(cityGroup);

    let raf = 0;
    let time = 0;
    const _forward = new THREE.Vector3();
    const _target = new THREE.Vector3();

    function applyProgress(progress: number) {
      const { pos, pitch } = cameraAt(progress);
      camera.position.copy(pos);

      // Yaw does the real orientation work: 0 = facing out (−z, at the
      // mountain), π = facing back (+z, at the city with the mountain behind).
      const yaw = Math.PI * smoothstep(YAW_WINDOW[0], YAW_WINDOW[1], progress);
      _forward.set(Math.sin(yaw), pitch, -Math.cos(yaw)).normalize();
      _target.copy(camera.position).addScaledVector(_forward, 400);
      camera.lookAt(_target);

      // The loop, layered on top — a full 2π nets to a no-op, so this can
      // never leave the camera pointing the wrong way.
      camera.rotateX(Math.PI * 2 * smoothstep(LOOP_WINDOW[0], LOOP_WINDOW[1], progress));

      // Rooftop lights come up as the city is approached, so the reveal reads
      // as a payoff beat rather than a hard cut.
      const reveal = smoothstep(0.55, 0.82, progress);
      beaconMeshes.forEach((beacon) => {
        (beacon.material as THREE.MeshBasicMaterial).opacity = reveal;
      });
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
      // directly, once, no animation loop at all.
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
      starGeo.dispose();
      starMat.dispose();
      glow.geometry.dispose();
      glowMat.dispose();
      mountains.forEach(({ mesh, rim }) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        rim.geometry.dispose();
        (rim.material as THREE.Material).dispose();
      });
      carGeo.dispose();
      carMat.dispose();
      treeGeo.dispose();
      treeMat.dispose();
      roadMat.dispose();
      cityGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          const material = child.material as THREE.MeshBasicMaterial;
          material.map?.dispose();
          if (!(child instanceof THREE.InstancedMesh)) material.dispose();
        }
      });
      composer.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- progressRef is a stable ref container; reducedMotion changes are handled by remounting via the key on the caller side if ever needed
  }, [reducedMotion]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #05060a 0%, #070c10 55%, #05060a 100%)" }} />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/*
        Left-side scrim. Once the mountain became the *bright* background
        subject (it has to be, to read against the night sky), the Hero's
        left-aligned copy was sitting on a mid-tone mauve and lost contrast.
        Darkening the mountain again would just undo the fix, so the copy gets
        its own ground instead — the standard treatment for hero text over
        imagery, and it keeps the right-hand side of the frame, where the city
        and peaks actually are, completely unobscured.
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(5,6,10,0.92) 0%, rgba(5,6,10,0.78) 34%, rgba(5,6,10,0.3) 58%, transparent 78%)",
        }}
      />
      {/* Legibility fade at the bottom of the pinned viewport. */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: "linear-gradient(180deg, transparent, #05060a 88%)" }}
      />
    </div>
  );
}
