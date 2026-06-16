"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { SceneCanvas } from "../core/SceneCanvas";
import { createHoloMaterial } from "../core/materials";
import { skillClusters, type SkillBody, type SkillCluster } from "@/lib/experience/data";
import { useExperience } from "@/lib/experience/store";
import { CREAM, EMBER, INK } from "@/lib/experience/palette";

/* ============================================================================
   SKILLS GALAXY — a living solar system. Each cluster is a tilted orbital
   ring; each technology a glowing body whose orbital speed and size scale
   with proficiency. Geometry is shared (one sphere for every body), and the
   whole system is positioned analytically per frame — no physics engine,
   no allocations, no re-renders in the loop.
   ========================================================================== */

interface SceneProps {
  /** cluster id focused from the DOM legend (dims the others) */
  focusCluster: string | null;
  /** bubble the hovered body up to the DOM readout */
  onHover: (info: { skill: SkillBody; cluster: SkillCluster } | null) => void;
}

const bodyGeometry = new THREE.SphereGeometry(1, 24, 24); // scaled per body

function OrbitingBody({
  skill,
  cluster,
  index,
  material,
  onHover,
}: {
  skill: SkillBody;
  cluster: SkillCluster;
  index: number;
  material: THREE.ShaderMaterial;
  onHover: SceneProps["onHover"];
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  // Stable orbital parameters derived from proficiency.
  const params = useMemo(() => {
    const angle = (index / cluster.skills.length) * Math.PI * 2;
    return {
      angle,
      speed: 0.04 + (skill.proficiency / 100) * 0.14,
      size: 0.14 + (skill.proficiency / 100) * 0.2,
      bobPhase: angle * 3.7,
    };
  }, [cluster.skills.length, index, skill.proficiency]);

  const angleRef = useRef(params.angle);

  useFrame((state, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    if (!reducedMotion) angleRef.current += delta * params.speed * (hovered ? 0.25 : 1);
    const a = angleRef.current;
    mesh.position.set(
      Math.cos(a) * cluster.radius,
      Math.sin(state.clock.elapsedTime * 0.8 + params.bobPhase) * 0.14,
      Math.sin(a) * cluster.radius,
    );
    const targetScale = params.size * (hovered ? 1.45 : 1);
    mesh.scale.setScalar(mesh.scale.x + (targetScale - mesh.scale.x) * (1 - Math.pow(0.001, delta)));
  });

  return (
    <mesh
      ref={ref}
      geometry={bodyGeometry}
      scale={params.size}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        onHover({ skill, cluster });
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        onHover(null);
        document.body.style.cursor = "";
      }}
    >
      <primitive object={material} attach="material" />
      {hovered && (
        <Html center distanceFactor={8} className="pointer-events-none select-none">
          <span className="whitespace-nowrap rounded-full border border-ink-border bg-ink/85 px-3 py-1 font-mono text-xs text-ink-text backdrop-blur-sm">
            {skill.name} · {skill.proficiency}
          </span>
        </Html>
      )}
    </mesh>
  );
}

function ClusterRing({
  cluster,
  dimmed,
  onHover,
}: {
  cluster: SkillCluster;
  dimmed: boolean;
  onHover: SceneProps["onHover"];
}) {
  const groupRef = useRef<THREE.Group>(null);

  // One material per cluster so focus-dimming is a single uniform write.
  const material = useMemo(() => createHoloMaterial(CREAM.base), []);
  useEffect(() => () => material.dispose(), [material]);

  const ringPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * cluster.radius, 0, Math.sin(a) * cluster.radius));
    }
    return pts;
  }, [cluster.radius]);

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    const target = dimmed ? 0.25 : 1.15;
    material.uniforms.uIntensity.value +=
      (target - material.uniforms.uIntensity.value) * (1 - Math.pow(0.001, delta));
  });

  return (
    <group ref={groupRef} rotation={[cluster.tilt, 0, cluster.tilt * 0.6]}>
      <Line
        points={ringPoints}
        color={dimmed ? 0x26262a : 0x3a3a40}
        transparent
        opacity={dimmed ? 0.3 : 0.75}
        lineWidth={1}
      />
      {/* Cluster nameplate riding the far edge of its ring. */}
      <Html
        center
        position={[cluster.radius, 0.4, 0]}
        distanceFactor={11}
        className="pointer-events-none select-none"
      >
        <span
          className="font-grotesk text-[11px] uppercase tracking-[0.22em]"
          style={{ color: dimmed ? "rgba(161,161,170,0.35)" : "rgba(161,161,170,0.9)" }}
        >
          {cluster.label}
        </span>
      </Html>
      {cluster.skills.map((skill, i) => (
        <OrbitingBody
          key={skill.name}
          skill={skill}
          cluster={cluster}
          index={i}
          material={material}
          onHover={onHover}
        />
      ))}
    </group>
  );
}

function GalaxyCore() {
  const ref = useRef<THREE.Mesh>(null);
  const { geometry, material } = useMemo(
    () => ({
      geometry: new THREE.IcosahedronGeometry(0.9, 2),
      material: createHoloMaterial(EMBER.base),
    }),
    [],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state, delta) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uIntensity.value = 1.6 + Math.sin(state.clock.elapsedTime * 1.4) * 0.25;
    if (ref.current) ref.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function Galaxy({ focusCluster, onHover }: SceneProps) {
  const rigRef = useRef<THREE.Group>(null);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  useFrame((state, delta) => {
    const rig = rigRef.current;
    if (!rig || reducedMotion) return;
    const damp = 1 - Math.pow(0.001, delta);
    rig.rotation.y += delta * 0.03 + (state.pointer.x * 0.25 - rig.rotation.y) * damp * 0.2;
    rig.rotation.x += (0.42 - state.pointer.y * 0.15 - rig.rotation.x) * damp;
  });

  return (
    <group ref={rigRef} rotation={[0.42, 0, 0]}>
      <GalaxyCore />
      {skillClusters.map((cluster) => (
        <ClusterRing
          key={cluster.id}
          cluster={cluster}
          dimmed={focusCluster !== null && focusCluster !== cluster.id}
          onHover={onHover}
        />
      ))}
    </group>
  );
}

export default function SkillsScene(props: SceneProps) {
  return (
    <SceneCanvas camera={{ position: [0, 2.4, 11.5], fov: 50 }}>
      <fogExp2 attach="fog" args={[INK.fog, 0.035]} />
      <Galaxy {...props} />
    </SceneCanvas>
  );
}
