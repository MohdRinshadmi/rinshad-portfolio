"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import gsap from "gsap";
import { SceneCanvas } from "../core/SceneCanvas";
import { createHoloMaterial, createParticleMaterial, seedParticles } from "../core/materials";
import { countForTier } from "@/lib/experience/capabilities";
import { useExperience } from "@/lib/experience/store";
import { EMBER, INK } from "@/lib/experience/palette";

/* ============================================================================
   HERO — "Digital Universe"
   A rising field of data-stream particles around a slowly turning holographic
   core. The camera rig leans toward the pointer; a GSAP timeline dollies the
   universe in on first paint. Everything is one Points draw call + two core
   meshes — postprocessing only on the "high" tier.
   ========================================================================== */

function DataStreams() {
  const tier = useExperience((s) => s.tier);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const count = countForTier(tier ?? "low", 6000);

  const points = useMemo(() => {
    const { positions, phases, speeds } = seedParticles(count, [30, 24, 18]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    const material = createParticleMaterial({ size: 42, emberRatio: 0.16 });
    return new THREE.Points(geometry, material);
  }, [count]);

  useEffect(() => {
    const material = points.material as THREE.ShaderMaterial;
    // Cinematic entrance — particles condense in over ~2.5s.
    if (reducedMotion) {
      material.uniforms.uReveal.value = 1;
      return () => {
        points.geometry.dispose();
        material.dispose();
      };
    }
    const tween = gsap.to(material.uniforms.uReveal, {
      value: 1,
      duration: 2.5,
      ease: "power2.out",
      delay: 0.2,
    });
    return () => {
      tween.kill();
      points.geometry.dispose();
      material.dispose();
    };
  }, [points, reducedMotion]);

  useFrame((state) => {
    (points.material as THREE.ShaderMaterial).uniforms.uTime.value =
      state.clock.elapsedTime;
  });

  return <primitive object={points} />;
}

function HoloCore() {
  const solidRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  const { geometry, wireGeometry, holo, wire } = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(1.7, 1);
    const wireGeometry = new THREE.IcosahedronGeometry(2.05, 1);
    const holo = createHoloMaterial(EMBER.base);
    const wire = new THREE.MeshBasicMaterial({
      color: EMBER.dim,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    return { geometry, wireGeometry, holo, wire };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      wireGeometry.dispose();
      holo.dispose();
      wire.dispose();
    },
    [geometry, wireGeometry, holo, wire],
  );

  useFrame((state, delta) => {
    holo.uniforms.uTime.value = state.clock.elapsedTime;
    if (solidRef.current) solidRef.current.rotation.y += delta * 0.12;
    if (wireRef.current) {
      wireRef.current.rotation.y -= delta * 0.07;
      wireRef.current.rotation.x += delta * 0.03;
    }
  });

  return (
    <group position={[3.2, 0.2, -2]}>
      <mesh ref={solidRef} geometry={geometry}>
        <primitive object={holo} attach="material" />
      </mesh>
      <mesh ref={wireRef} geometry={wireGeometry}>
        <primitive object={wire} attach="material" />
      </mesh>
    </group>
  );
}

/** Leans the whole universe toward the pointer — subtle, damped, mouse-only. */
function ParallaxRig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  useEffect(() => {
    const group = ref.current;
    if (!group || reducedMotion) return;
    // Entrance dolly — the universe settles forward as the copy reveals.
    group.position.z = -5;
    const tween = gsap.to(group.position, {
      z: 0,
      duration: 2.8,
      ease: "expo.out",
      delay: 0.15,
    });
    return () => {
      tween.kill();
    };
  }, [reducedMotion]);

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group || reducedMotion) return;
    const damp = 1 - Math.pow(0.001, delta); // framerate-independent lerp
    group.rotation.y += (state.pointer.x * 0.1 - group.rotation.y) * damp;
    group.rotation.x += (-state.pointer.y * 0.06 - group.rotation.x) * damp;
  });

  return <group ref={ref}>{children}</group>;
}

function Effects() {
  const tier = useExperience((s) => s.tier);
  const aberration = useMemo(() => new THREE.Vector2(0.0005, 0.0005), []);
  if (tier !== "high") return null;
  return (
    <EffectComposer>
      <Bloom intensity={0.55} luminanceThreshold={0.18} mipmapBlur />
      <ChromaticAberration offset={aberration} />
      <Vignette offset={0.22} darkness={0.72} />
    </EffectComposer>
  );
}

export default function HeroScene() {
  return (
    <SceneCanvas camera={{ position: [0, 0, 10], fov: 55 }}>
      <color attach="background" args={[INK.bg]} />
      <fogExp2 attach="fog" args={[INK.fog, 0.045]} />
      <ParallaxRig>
        <DataStreams />
        <HoloCore />
      </ParallaxRig>
      <Effects />
    </SceneCanvas>
  );
}
