"use client";

/**
 * Live Three.js/WebGL replacement for the old SVG DataFlowDiagram — reused
 * (same component, different node labels/DiagramState) across Sections 03, 06,
 * and 07's right side. See context/tech-notes.md "3D pipeline" and
 * src/lib/scene-config.ts for the node/state contract.
 */
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { DIAGRAM_EDGES, type DiagramNode3D, type DiagramState } from "@/lib/scene-config";

function LookAt({ target }: { target: [number, number, number] }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(target[0], target[1], target[2]);
  }, [camera, target]);
  return null;
}

function NodeMesh({ node, state }: { node: DiagramNode3D; state: DiagramState }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.LineSegments>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const radius = node.accent === "bright" ? 0.36 : 0.27;
  const color = node.accent === "cyan" ? 0x22d3ee : 0x34d399;
  const coreGeo = useMemo(() => new THREE.IcosahedronGeometry(radius, 1), [radius]);
  const wireGeo = useMemo(
    () => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(radius * 1.4, 0)),
    [radius],
  );

  useFrame(() => {
    const v = state.nodes[node.id]?.value ?? 0;
    if (coreRef.current) (coreRef.current.material as THREE.MeshStandardMaterial).opacity = v * 0.85;
    if (wireRef.current) (wireRef.current.material as THREE.LineBasicMaterial).opacity = v * 0.22;
    if (lightRef.current) lightRef.current.intensity = v * (node.accent === "bright" ? 1.0 : 0);
    if (labelRef.current) labelRef.current.style.opacity = String(v);
  });

  return (
    <group position={node.position}>
      <mesh ref={coreRef} geometry={coreGeo}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={node.accent === "bright" ? 0.85 : 0.45}
          transparent
          opacity={0}
          roughness={0.35}
        />
      </mesh>
      <lineSegments ref={wireRef} geometry={wireGeo}>
        <lineBasicMaterial color={0xffffff} transparent opacity={0} />
      </lineSegments>
      {node.accent === "bright" && (
        <pointLight ref={lightRef} color={color} intensity={0} distance={5.5} />
      )}
      <Html center style={{ pointerEvents: "none" }}>
        <div
          ref={labelRef}
          className="rounded-full border border-border bg-surface/85 px-4 py-1.5 text-sm whitespace-nowrap text-foreground backdrop-blur-sm"
          style={{ opacity: 0 }}
        >
          {node.label}
        </div>
      </Html>
    </group>
  );
}

function EdgeTube({
  from,
  to,
  edgeKey,
  seedIndex,
  state,
  animate,
}: {
  from: [number, number, number];
  to: [number, number, number];
  edgeKey: string;
  /** Deterministic per-edge stagger for the flowing particle's start position. */
  seedIndex: number;
  state: DiagramState;
  animate: boolean;
}) {
  const tubeRef = useRef<THREE.Mesh>(null);
  const particleRef = useRef<THREE.Mesh>(null);
  const offset = useRef((seedIndex * 0.618) % 1);

  const curve = useMemo(() => {
    const mid: [number, number, number] = [
      (from[0] + to[0]) / 2,
      (from[1] + to[1]) / 2 + 0.35,
      (from[2] + to[2]) / 2,
    ];
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(...from),
      new THREE.Vector3(...mid),
      new THREE.Vector3(...to),
    ]);
  }, [from, to]);
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 24, 0.018, 6, false), [curve]);

  useFrame((_, delta) => {
    const v = state.edges[edgeKey]?.value ?? 0;
    if (tubeRef.current) (tubeRef.current.material as THREE.MeshBasicMaterial).opacity = v * 0.32;
    if (animate) offset.current = (offset.current + Math.min(delta, 0.05) * 0.18) % 1;
    if (particleRef.current) {
      particleRef.current.position.copy(curve.getPointAt(offset.current));
      (particleRef.current.material as THREE.MeshBasicMaterial).opacity = v;
    }
  });

  return (
    <>
      <mesh ref={tubeRef} geometry={tubeGeo}>
        <meshBasicMaterial color={0x34d399} transparent opacity={0} />
      </mesh>
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color={0x9ffcd6} transparent opacity={0} />
      </mesh>
    </>
  );
}

function SwayGroup({ animate, children }: { animate: boolean; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, delta) => {
    if (!animate || !group.current) return;
    t.current += Math.min(delta, 0.05);
    group.current.rotation.y = Math.sin(t.current * 0.22) * 0.14;
    group.current.rotation.x = Math.sin(t.current * 0.16) * 0.035;
  });
  return <group ref={group}>{children}</group>;
}

export function DiagramScene3D({
  nodes,
  state,
  animate = true,
  className = "",
  ariaLabel,
}: {
  nodes: DiagramNode3D[];
  state: DiagramState;
  /** Idle sway + particle flow — disabled under prefers-reduced-motion. */
  animate?: boolean;
  className?: string;
  ariaLabel: string;
}) {
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <div className={`relative h-full w-full ${className}`} role="img" aria-label={ariaLabel}>
      <Canvas
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        camera={{ position: [0, 1.0, 11], fov: 30 }}
      >
        <LookAt target={[0, 0.3, 0]} />
        <ambientLight color={0x99aabb} intensity={0.75} />
        <SwayGroup animate={animate}>
          {DIAGRAM_EDGES.map(([a, b], i) => {
            const from = byId[a]?.position;
            const to = byId[b]?.position;
            if (!from || !to) return null;
            return (
              <EdgeTube
                key={`${a}-${b}`}
                from={from}
                to={to}
                edgeKey={`${a}-${b}`}
                seedIndex={i}
                state={state}
                animate={animate}
              />
            );
          })}
          {nodes.map((n) => (
            <NodeMesh key={n.id} node={n} state={state} />
          ))}
        </SwayGroup>
      </Canvas>
    </div>
  );
}
