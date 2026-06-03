"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sphere } from "@react-three/drei/core/shapes";
import { MeshDistortMaterial } from "@react-three/drei/core/MeshDistortMaterial";
import { Float } from "@react-three/drei/core/Float";
import { Stars } from "@react-three/drei/core/Stars";
import * as THREE from "three";

function FloatingSphere({
  position,
  scale,
  speed,
  distort,
  color,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
  distort: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.3;
    meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
  });

  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position} scale={scale}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </Sphere>
    </Float>
  );
}

function ParticleField() {
  const count = 600;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#a78bfa" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function MouseTracker() {
  const { camera } = useThree();
  useFrame((state) => {
    camera.position.x += (state.mouse.x * 0.3 - camera.position.x) * 0.04;
    camera.position.y += (state.mouse.y * 0.2 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#a78bfa" />
        <pointLight position={[-5, -3, -5]} intensity={0.5} color="#6366f1" />
        <pointLight position={[5, -3, 5]} intensity={0.3} color="#8b5cf6" />

        <MouseTracker />
        <ParticleField />
        <Stars radius={60} depth={50} count={1200} factor={2} fade speed={0.4} />

        <FloatingSphere
          position={[3.5, 0.5, -1]}
          scale={1.1}
          speed={1.2}
          distort={0.4}
          color="#7c3aed"
        />
        <FloatingSphere
          position={[-3.5, -0.5, -2]}
          scale={0.8}
          speed={0.8}
          distort={0.35}
          color="#4f46e5"
        />
        <FloatingSphere
          position={[1.5, -2.5, -3]}
          scale={0.5}
          speed={1.5}
          distort={0.5}
          color="#6d28d9"
        />
      </Canvas>
    </div>
  );
}
