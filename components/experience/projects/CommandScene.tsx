"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { SceneCanvas } from "../core/SceneCanvas";
import { createHoloMaterial, createParticleMaterial, seedParticles } from "../core/materials";
import { countForTier } from "@/lib/experience/capabilities";
import { useExperience } from "@/lib/experience/store";
import { CREAM, EMBER, INK } from "@/lib/experience/palette";

/* ============================================================================
   COMMAND CENTER — ambient deck. The interactive modules are accessible DOM
   cards in the section; this scene is the hangar around them: drifting data
   particles and holographic frame ghosts floating in parallax behind the
   real modules.
   ========================================================================== */

function FrameGhost({
  position,
  rotation,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: number;
}) {
  const { geometry, material } = useMemo(
    () => ({
      geometry: new THREE.PlaneGeometry(3.4, 2.1, 6, 4),
      material: createHoloMaterial(color),
    }),
    [color],
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
    material.uniforms.uIntensity.value = 0.5;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
      <mesh geometry={geometry} position={position} rotation={rotation}>
        <primitive object={material} attach="material" />
      </mesh>
    </Float>
  );
}

function Deck() {
  const tier = useExperience((s) => s.tier);

  const points = useMemo(() => {
    const count = countForTier(tier ?? "low", 2200);
    const { positions, phases, speeds } = seedParticles(count, [26, 18, 14]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    const material = createParticleMaterial({ size: 26, emberRatio: 0.12 });
    material.uniforms.uReveal.value = 1;
    return new THREE.Points(geometry, material);
  }, [tier]);

  useEffect(
    () => () => {
      points.geometry.dispose();
      (points.material as THREE.Material).dispose();
    },
    [points],
  );

  useFrame((state) => {
    (points.material as THREE.ShaderMaterial).uniforms.uTime.value =
      state.clock.elapsedTime * 0.5;
  });

  return (
    <>
      <primitive object={points} />
      <FrameGhost position={[-5.2, 1.6, -4]} rotation={[0.1, 0.5, -0.04]} color={CREAM.base} />
      <FrameGhost position={[5.4, -1.2, -5]} rotation={[-0.08, -0.45, 0.05]} color={EMBER.base} />
      <FrameGhost position={[0.4, 2.8, -7]} rotation={[0.2, 0.1, 0.08]} color={CREAM.base} />
    </>
  );
}

export default function CommandScene() {
  return (
    <SceneCanvas camera={{ position: [0, 0, 9], fov: 52 }}>
      <fogExp2 attach="fog" args={[INK.fog, 0.05]} />
      <Deck />
    </SceneCanvas>
  );
}
