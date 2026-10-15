"use client";
/* eslint-disable react-hooks/refs -- preserved Three.js scene lifecycle */

import { useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Group } from "three";

export default function FloatingCar() {
  const groupRef = useRef<Group>(null);
  const gltf = useLoader(GLTFLoader, "/3d/2014genesiscoupe.glb");
  const sceneRef = useRef<Group | null>(null);

  // Lazy-init: clone the model once
  if (sceneRef.current === null && gltf?.scene) {
    const scene = gltf.scene.clone(true);
    // Scale the car to a reasonable size in scene units
    scene.scale.set(0.4, 0.4, 0.4);
    sceneRef.current = scene;
  }

  // Gentle tumble + slow drift orbit to simulate floating space debris
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Slow tumble rotation
    groupRef.current.rotation.x = t * 0.15;
    groupRef.current.rotation.y = t * 0.25;
    groupRef.current.rotation.z = t * 0.1;

    // Small bobbing drift within a bounded area opposite the comet
    groupRef.current.position.x = -2 + Math.sin(t * 0.05) * 1;
    groupRef.current.position.y = 0.5;
    groupRef.current.position.z = -0.3 + Math.cos(t * 0.05) * 1;
  });

  if (!sceneRef.current) return null;
  return (
    <group ref={groupRef}>
      {/* Local lighting for the car only — short decay/distance so it doesn't
          bleed into the sky dome or other scene elements */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <directionalLight position={[-3, -2, -5]} intensity={0.4} />
      <pointLight position={[0, 2, 3]} intensity={1} distance={15} decay={2} />
      <primitive object={sceneRef.current} />
    </group>
  );
}
