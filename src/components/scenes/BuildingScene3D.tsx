"use client";

/**
 * Live Three.js/WebGL replacement for the old SVG BuildingIllustration — see
 * context/tech-notes.md "3D pipeline" for why this superseded the baked-frames
 * plan. Materials are created by the caller (createBuildingMaterials) and passed
 * in as props specifically so HeroSection/WaitlistSection's GSAP scroll timelines
 * can tween real Material/Light properties directly (gsap.to accepts any object
 * with numeric properties, not just DOM selectors) instead of routing through
 * React state and fighting re-renders on every scroll tick.
 */
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";

const FLOOR_COUNT = 5;
const FLOOR_W = 3.6;
const FLOOR_D = 2.4;
const FLOOR_H = 0.55;
const FLOOR_GAP = 0.1;

export type FloorMaterials = {
  wire: THREE.LineBasicMaterial | THREE.LineDashedMaterial;
  solid: THREE.MeshStandardMaterial;
  glow: THREE.PointLight;
};

/** One fresh material set per scene instance — see file header for why. */
export function createBuildingMaterials(): FloorMaterials[] {
  return Array.from({ length: FLOOR_COUNT }, (_, i) => {
    const isBlueprint = i === 0;
    const isTop = i === FLOOR_COUNT - 1;
    const color = i % 2 === 1 ? 0x22d3ee : 0x34d399;

    const wire = isBlueprint
      ? new THREE.LineDashedMaterial({
          color: 0x5b6470,
          dashSize: 0.12,
          gapSize: 0.08,
          transparent: true,
          opacity: 0,
        })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 });

    const solid = new THREE.MeshStandardMaterial({
      color: isTop ? 0x34d399 : color,
      emissive: isTop ? 0x34d399 : color,
      emissiveIntensity: 0,
      transparent: true,
      opacity: 0,
      roughness: 0.3,
      metalness: 0.1,
    });

    const glow = new THREE.PointLight(0x34d399, 0, 6);

    return { wire, solid, glow };
  });
}

function Floors({ floorMaterials }: { floorMaterials: FloorMaterials[] }) {
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, FLOOR_H, 1), []);

  return (
    <>
      {floorMaterials.map((mats, i) => {
        const scaleX = 1 - i * 0.14;
        const scaleZ = 1 - i * 0.1;
        const y = i * (FLOOR_H + FLOOR_GAP) + FLOOR_H / 2;
        const edgesGeo = new THREE.EdgesGeometry(
          new THREE.BoxGeometry(FLOOR_W * scaleX, FLOOR_H, FLOOR_D * scaleZ),
        );
        return (
          <group key={i} position={[0, y, 0]}>
            <mesh geometry={boxGeo} material={mats.solid} scale={[FLOOR_W * scaleX, 1, FLOOR_D * scaleZ]} />
            <lineSegments
              geometry={edgesGeo}
              material={mats.wire}
              ref={(obj) => {
                if (obj && mats.wire instanceof THREE.LineDashedMaterial) obj.computeLineDistances();
              }}
            />
            <primitive object={mats.glow} position={[0, 0.3, 0]} />
          </group>
        );
      })}
    </>
  );
}

function RotatingRig({
  autoRotate,
  children,
}: {
  autoRotate: boolean;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  const state = useRef({ target: Math.PI * 0.22, current: Math.PI * 0.22, dragging: false, lastX: 0 });

  useEffect(() => {
    const s = state.current;
    const onDown = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = e.clientX;
    };
    const onMove = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.target += (e.clientX - s.lastX) * 0.01;
      s.lastX = e.clientX;
    };
    const onUp = () => {
      s.dragging = false;
    };
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  useFrame((_, delta) => {
    const s = state.current;
    const dt = Math.min(delta, 0.05);
    if (autoRotate && !s.dragging) s.target += dt * 0.1;
    s.current += (s.target - s.current) * Math.min(1, dt * 6);
    if (group.current) group.current.rotation.y = s.current;
  });

  return <group ref={group}>{children}</group>;
}

export function BuildingScene3D({
  floorMaterials,
  autoRotate = true,
  className = "",
  ariaLabel,
}: {
  floorMaterials: FloorMaterials[];
  autoRotate?: boolean;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <div
      className={`h-full w-full cursor-grab touch-none active:cursor-grabbing ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <Canvas
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        onCreated={({ scene }) => {
          scene.background = null;
        }}
      >
        <OrthographicCamera
          makeDefault
          position={[7, 6, 7]}
          zoom={70}
          near={0.1}
          far={100}
          ref={(cam) => cam?.lookAt(0, 1, 0)}
        />
        <ambientLight color={0x99aabb} intensity={0.55} />
        <directionalLight color={0xffffff} intensity={0.7} position={[5, 8, 4]} />
        <gridHelper args={[16, 16, 0x18302a, 0x0d1216]} position={[0, -0.02, 0]} />
        <RotatingRig autoRotate={autoRotate}>
          <group position={[0, -((FLOOR_COUNT * (FLOOR_H + FLOOR_GAP)) / 2) + 0.25, 0]}>
            <Floors floorMaterials={floorMaterials} />
          </group>
        </RotatingRig>
      </Canvas>
    </div>
  );
}
