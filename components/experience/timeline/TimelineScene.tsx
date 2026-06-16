"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Grid, Html, Line } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { SceneCanvas } from "../core/SceneCanvas";
import { createHoloMaterial, createParticleMaterial, seedParticles } from "../core/materials";
import { milestones } from "@/lib/experience/data";
import { countForTier } from "@/lib/experience/capabilities";
import { useExperience } from "@/lib/experience/store";
import { CSS, EMBER, INK } from "@/lib/experience/palette";

/* ============================================================================
   CAREER CORRIDOR — the camera flies down an endless dark corridor; each
   milestone is a holographic ring gate. Scroll progress (a framer
   MotionValue, read imperatively — zero React re-renders per frame) drives
   the camera; the active gate brightens as you pass through it.
   ========================================================================== */

const SPACING = 8; // z-distance between milestone gates

/** World position of gate i — gates alternate left/right of the flight path. */
export function gatePosition(i: number): [number, number, number] {
  return [i % 2 === 0 ? -2.1 : 2.1, 0, -i * SPACING];
}

function MilestoneGate({ index, active }: { index: number; active: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const { ring, core, holo, coreMat } = useMemo(() => {
    const ring = new THREE.TorusGeometry(1.5, 0.035, 12, 64);
    const core = new THREE.SphereGeometry(0.16, 20, 20);
    const holo = createHoloMaterial(EMBER.base);
    const coreMat = new THREE.MeshBasicMaterial({ color: EMBER.base });
    return { ring, core, holo, coreMat };
  }, []);

  useEffect(
    () => () => {
      ring.dispose();
      core.dispose();
      holo.dispose();
      coreMat.dispose();
    },
    [ring, core, holo, coreMat],
  );

  useFrame((state, delta) => {
    holo.uniforms.uTime.value = state.clock.elapsedTime;
    const damp = 1 - Math.pow(0.001, delta);
    const target = active ? 1.9 : 0.65;
    holo.uniforms.uIntensity.value +=
      (target - holo.uniforms.uIntensity.value) * damp;
    if (ringRef.current) ringRef.current.rotation.z += delta * (active ? 0.35 : 0.1);
  });

  const m = milestones[index];

  return (
    <group position={gatePosition(index)}>
      <mesh ref={ringRef} geometry={ring}>
        <primitive object={holo} attach="material" />
      </mesh>
      <mesh geometry={core}>
        <primitive object={coreMat} attach="material" />
      </mesh>
      {/* Floating year tag — decorative; real content lives in the DOM card. */}
      <Html center position={[0, 2.1, 0]} distanceFactor={9} className="pointer-events-none select-none">
        <span
          className="font-mono text-xs uppercase tracking-[0.2em]"
          style={{ color: active ? CSS.ember : "rgba(250,250,249,0.45)" }}
        >
          {m.year} — {m.title}
        </span>
      </Html>
    </group>
  );
}

function Corridor({ progress }: { progress: MotionValue<number> }) {
  const tier = useExperience((s) => s.tier);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const activeMilestone = useExperience((s) => s.activeMilestone);

  // Flight-path line threading every gate.
  const pathPoints = useMemo(() => {
    const pts = milestones.map((_, i) => new THREE.Vector3(...gatePosition(i)));
    pts.unshift(new THREE.Vector3(0, 0, SPACING));
    return new THREE.CatmullRomCurve3(pts).getPoints(120);
  }, []);

  // Sparse dust so the corridor depth always reads.
  const dust = useMemo(() => {
    const count = countForTier(tier ?? "low", 1500);
    const { positions, phases, speeds } = seedParticles(count, [18, 14, SPACING * milestones.length + 16]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    const material = createParticleMaterial({ size: 24, emberRatio: 0.1 });
    material.uniforms.uReveal.value = 1;
    const points = new THREE.Points(geometry, material);
    points.position.z = (-SPACING * (milestones.length - 1)) / 2;
    return points;
  }, [tier]);

  useEffect(
    () => () => {
      dust.geometry.dispose();
      (dust.material as THREE.Material).dispose();
    },
    [dust],
  );

  useFrame((state, delta) => {
    (dust.material as THREE.ShaderMaterial).uniforms.uTime.value =
      state.clock.elapsedTime * 0.4;

    // Scroll → flight. Read the MotionValue imperatively each frame.
    const p = progress.get();
    const targetZ = 4 - p * SPACING * (milestones.length - 1);
    const ahead = gatePosition(Math.min(activeMilestone, milestones.length - 1));
    const damp = reducedMotion ? 1 : 1 - Math.pow(0.0005, delta);
    state.camera.position.z += (targetZ - state.camera.position.z) * damp;
    state.camera.position.x += (ahead[0] * 0.3 - state.camera.position.x) * damp;
    state.camera.lookAt(ahead[0] * 0.5, 0, state.camera.position.z - SPACING);
  });

  return (
    <>
      <Line points={pathPoints} color={EMBER.dim} transparent opacity={0.5} lineWidth={1} />
      {milestones.map((m, i) => (
        <MilestoneGate key={m.id} index={i} active={i === activeMilestone} />
      ))}
      <primitive object={dust} />
      <Grid
        position={[0, -2.4, -20]}
        args={[10, 10]}
        cellSize={1.1}
        cellThickness={0.55}
        cellColor="#2a2a2e"
        sectionSize={5.5}
        sectionThickness={1}
        sectionColor="#3d2018"
        fadeDistance={42}
        fadeStrength={1.6}
        infiniteGrid
        followCamera
      />
    </>
  );
}

export default function TimelineScene({ progress }: { progress: MotionValue<number> }) {
  return (
    <SceneCanvas camera={{ position: [0, 0, 4], fov: 60 }}>
      <fogExp2 attach="fog" args={[INK.fog, 0.05]} />
      <Corridor progress={progress} />
    </SceneCanvas>
  );
}
