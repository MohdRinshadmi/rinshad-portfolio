"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Line, MapControls } from "@react-three/drei";
import { SceneCanvas } from "../core/SceneCanvas";
import { createHoloMaterial } from "../core/materials";
import type { FlagshipProject } from "@/lib/experience/data";
import { useExperience } from "@/lib/experience/store";
import { CREAM, EMBER, INK } from "@/lib/experience/palette";

/* ============================================================================
   ARCHITECTURE SIMULATOR — a live system diagram. Services are holographic
   stations; requests are ember packets flowing along bezier conduits at each
   edge's real traffic rate. ONE InstancedMesh renders every packet in the
   simulation (a single draw call); drag pans, the DOM buttons zoom.
   ========================================================================== */

const BASE_DISTANCE = 9.5;

interface SceneProps {
  project: FlagshipProject;
  /** 1 = default framing; >1 zooms in (driven by the DOM controls) */
  zoom: number;
}

function ServiceNode({
  label,
  sub,
  position,
  hot,
}: {
  label: string;
  sub: string;
  position: [number, number];
  hot?: boolean;
}) {
  const { geometry, material } = useMemo(
    () => ({
      geometry: new THREE.PlaneGeometry(1.9, 1.05),
      material: createHoloMaterial(hot ? EMBER.base : CREAM.base),
    }),
    [hot],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uIntensity.value = hot ? 1.2 : 0.8;
  });

  return (
    <group position={[position[0], position[1], 0]}>
      <mesh geometry={geometry}>
        <primitive object={material} attach="material" />
      </mesh>
      <Html center distanceFactor={8.5} className="pointer-events-none select-none text-center">
        <div className="whitespace-nowrap">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-ink-text">
            {label}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-ink-text-tertiary">{sub}</p>
        </div>
      </Html>
    </group>
  );
}

function Packets({ project }: { project: FlagshipProject }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const { curves, packets, geometry, material } = useMemo(() => {
    const byId = Object.fromEntries(project.architecture.nodes.map((n) => [n.id, n.pos]));
    const curves = project.architecture.edges.map((edge) => {
      const a = byId[edge.from];
      const b = byId[edge.to];
      const mid = new THREE.Vector3(
        (a[0] + b[0]) / 2,
        (a[1] + b[1]) / 2 + (a[0] < b[0] ? 0.7 : -0.7),
        0.3,
      );
      return new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(a[0], a[1], 0),
        mid,
        new THREE.Vector3(b[0], b[1], 0),
      );
    });
    // Packet density follows the edge's traffic rate.
    const packets = project.architecture.edges.flatMap((edge, e) =>
      Array.from({ length: Math.max(2, Math.round(edge.rate * 3)) }, (_, i) => ({
        curve: e,
        offset: i / Math.max(2, Math.round(edge.rate * 3)),
        speed: 0.1 + edge.rate * 0.06,
      })),
    );
    const geometry = new THREE.SphereGeometry(0.07, 10, 10);
    const material = new THREE.MeshBasicMaterial({
      color: EMBER.base,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return { curves, packets, geometry, material };
  }, [project]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    packets.forEach((packet, i) => {
      const u = (t * packet.speed + packet.offset) % 1;
      const point = curves[packet.curve].getPoint(u);
      dummy.position.copy(point);
      // Packets swell mid-flight — reads as energy, not geometry.
      const s = 0.7 + Math.sin(u * Math.PI) * 0.6;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      {curves.map((curve, i) => (
        <Line
          key={`${project.slug}-${i}`}
          points={curve.getPoints(36)}
          color={EMBER.dim}
          transparent
          opacity={0.45}
          lineWidth={1}
        />
      ))}
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, packets.length]}
        frustumCulled={false}
      />
    </>
  );
}

function ZoomRig({ zoom }: { zoom: number }) {
  useFrame((state, delta) => {
    const cam = state.camera;
    const targetZ = BASE_DISTANCE / zoom;
    cam.position.z += (targetZ - cam.position.z) * (1 - Math.pow(0.001, delta));
  });
  return null;
}

export default function ArchitectureScene({ project, zoom }: SceneProps) {
  const reducedMotion = useExperience((s) => s.reducedMotion);
  return (
    // The simulation keeps flowing under reduced motion — it's meaning
    // (system behavior), not decoration — but the camera stops drifting.
    <SceneCanvas camera={{ position: [0, 0, BASE_DISTANCE], fov: 50 }} ignoreReducedMotion>
      <fogExp2 attach="fog" args={[INK.fog, 0.02]} />
      <group key={project.slug}>
        {project.architecture.nodes.map((node) => (
          <ServiceNode
            key={node.id}
            label={node.label}
            sub={node.sub}
            position={node.pos}
            hot={node.id === "api" || node.id === "llm"}
          />
        ))}
        <Packets project={project} />
      </group>
      <ZoomRig zoom={zoom} />
      {!reducedMotion && (
        <MapControls
          enableRotate={false}
          enableZoom={false}
          panSpeed={0.8}
          screenSpacePanning
        />
      )}
    </SceneCanvas>
  );
}
