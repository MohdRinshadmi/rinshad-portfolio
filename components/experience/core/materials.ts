import * as THREE from "three";
import { CREAM, EMBER } from "@/lib/experience/palette";

/* ============================================================================
   SHARED SHADER MATERIALS — created once per scene via useMemo and attached
   with <primitive>. Shaders live as template strings so Turbopack needs no
   GLSL loader. All effects are GPU-driven (time uniform, no per-frame JS).
   ========================================================================== */

/**
 * Holographic fresnel — rim-lit translucent surface used for milestone nodes,
 * the galaxy core, and project modules. Additive so overlapping holograms
 * brighten like light, not paint.
 */
export function createHoloMaterial(color: number = EMBER.base) {
  return new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vNormal = normalize(normalMatrix * normal);
        vViewDir = normalize(cameraPosition - worldPos.xyz);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;
      void main() {
        // Rim term — strongest at grazing angles (the hologram edge glow).
        float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewDir))), 2.0);
        // Slow holographic scanlines drifting up in world space.
        float scan = 0.85 + 0.15 * sin(vWorldPos.y * 24.0 - uTime * 2.0);
        float alpha = clamp(fresnel * scan * uIntensity, 0.0, 1.0);
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
  });
}

/**
 * Data-stream particles — soft round sprites with per-particle phase, rising
 * drift and a horizontal sine wander, all computed in the vertex shader.
 * One draw call for the whole field.
 */
export function createParticleMaterial({
  size = 36,
  emberRatio = 0.18,
}: { size?: number; emberRatio?: number } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: size },
      uReveal: { value: 0 }, // 0→1 cinematic entrance
      uCream: { value: new THREE.Color(CREAM.base) },
      uEmber: { value: new THREE.Color(EMBER.base) },
      uEmberRatio: { value: emberRatio },
    },
    vertexShader: /* glsl */ `
      attribute float aPhase;   // 0..1 random per particle
      attribute float aSpeed;   // rise speed multiplier
      uniform float uTime;
      uniform float uSize;
      uniform float uReveal;
      varying float vPhase;
      varying float vDepth;
      void main() {
        vPhase = aPhase;
        vec3 p = position;
        // Rise and wrap within a 24-unit tall volume; sine wander in x/z.
        float h = 24.0;
        p.y = mod(p.y + uTime * aSpeed, h) - h * 0.5;
        p.x += sin(uTime * 0.35 + aPhase * 6.2831) * 0.6;
        p.z += cos(uTime * 0.28 + aPhase * 6.2831) * 0.6;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vDepth = clamp(-mv.z / 30.0, 0.0, 1.0);
        gl_Position = projectionMatrix * mv;
        float entrance = smoothstep(0.0, 1.0, uReveal - aPhase * 0.35);
        gl_PointSize = uSize * entrance * (1.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uCream;
      uniform vec3 uEmber;
      uniform float uEmberRatio;
      varying float vPhase;
      varying float vDepth;
      void main() {
        // Soft round sprite, no texture fetch.
        float d = length(gl_PointCoord - 0.5);
        float alpha = smoothstep(0.5, 0.05, d);
        vec3 color = vPhase < uEmberRatio ? uEmber : uCream;
        // Fade with depth so the fog feels volumetric.
        gl_FragColor = vec4(color, alpha * (0.85 - vDepth * 0.6));
      }
    `,
  });
}

/** Fill a particle field's buffers: positions in a box + phase/speed attrs. */
export function seedParticles(count: number, spread: [number, number, number]) {
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * spread[0];
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
    phases[i] = Math.random();
    speeds[i] = 0.3 + Math.random() * 0.9;
  }
  return { positions, phases, speeds };
}
