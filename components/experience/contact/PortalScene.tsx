"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SceneCanvas } from "../core/SceneCanvas";
import { createHoloMaterial, createParticleMaterial, seedParticles } from "../core/materials";
import { countForTier } from "@/lib/experience/capabilities";
import { useExperience } from "@/lib/experience/store";
import { EMBER, INK } from "@/lib/experience/palette";

/* ============================================================================
   CONTACT PORTAL — a slowly turning holographic gate behind the terminal.
   Two nested rings + rising dust; the gate flares while a transmission is
   in flight (`charged`), confirming the send in the scene itself.
   ========================================================================== */

function Portal({ charged }: { charged: boolean }) {
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  const { outer, inner, holo } = useMemo(
    () => ({
      outer: new THREE.TorusGeometry(2.6, 0.04, 12, 80),
      inner: new THREE.TorusGeometry(2.1, 0.02, 12, 72),
      holo: createHoloMaterial(EMBER.base),
    }),
    [],
  );
  useEffect(
    () => () => {
      outer.dispose();
      inner.dispose();
      holo.dispose();
    },
    [outer, inner, holo],
  );

  useFrame((state, delta) => {
    holo.uniforms.uTime.value = state.clock.elapsedTime;
    const target = charged ? 2.2 : 1.0;
    holo.uniforms.uIntensity.value +=
      (target - holo.uniforms.uIntensity.value) * (1 - Math.pow(0.001, delta));
    if (outerRef.current) outerRef.current.rotation.z += delta * (charged ? 0.8 : 0.15);
    if (innerRef.current) innerRef.current.rotation.z -= delta * (charged ? 1.1 : 0.22);
  });

  return (
    <group rotation={[0.3, -0.35, 0]} position={[2.6, 0, -2]}>
      <mesh ref={outerRef} geometry={outer}>
        <primitive object={holo} attach="material" />
      </mesh>
      <mesh ref={innerRef} geometry={inner}>
        <primitive object={holo} attach="material" />
      </mesh>
    </group>
  );
}

function Dust() {
  const tier = useExperience((s) => s.tier);
  const points = useMemo(() => {
    const count = countForTier(tier ?? "low", 1200);
    const { positions, phases, speeds } = seedParticles(count, [22, 16, 10]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    const material = createParticleMaterial({ size: 22, emberRatio: 0.2 });
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
      state.clock.elapsedTime * 0.6;
  });

  return <primitive object={points} />;
}

export default function PortalScene({ charged }: { charged: boolean }) {
  return (
    <SceneCanvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <fogExp2 attach="fog" args={[INK.fog, 0.05]} />
      <Portal charged={charged} />
      <Dust />
    </SceneCanvas>
  );
}
