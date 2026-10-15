"use client";
/* eslint-disable react-hooks/immutability -- preserved Three.js camera updates */

import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * Moves the camera along a lemniscate of Bernoulli (sideways figure-8),
 * always looking at the origin.
 *
 * @param amplitude — controls the size/exaggeration of the figure-8.
 *   0 = no movement, 1 = subtle, larger = wider sweep.
 * @param speed — how fast the camera traces the path (radians/sec).
 * @param zoomed — when true, smoothly lerps FOV down to create a zoom-in effect.
 */
interface LemniscateCameraProps {
  amplitude?: number;
  speed?: number;
  zoomed?: boolean;
}

export default function LemniscateCamera({
  amplitude = 0.05,
  speed = 0.01,
  zoomed = false,
}: LemniscateCameraProps) {
  const { camera } = useThree();

  useFrame((state) => {
    // Phase offset π/2 so the figure-8 starts at center (lx=0, ly=0)
    const t = state.clock.elapsedTime * speed + Math.PI / 2;

    const sinT = Math.sin(t);
    const cosT = Math.cos(t);
    const denom = 1 + sinT * sinT;

    const lx = cosT / denom;
    const ly = (sinT * cosT) / denom;

    // Camera stays at origin — only the look direction sweeps a figure-8
    camera.position.set(0, 0, 0.01);
    camera.lookAt(lx * amplitude, ly * amplitude, -100);

    // Smooth FOV zoom (75 → 65 when zoomed)
    const targetFov = zoomed ? 65 : 75;
    if ("fov" in camera) {
      const pc = camera as THREE.PerspectiveCamera;
      pc.fov += (targetFov - pc.fov) * 0.03;
      pc.updateProjectionMatrix();
    }

    camera.updateMatrixWorld();
  });

  return null;
}
