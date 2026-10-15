"use client";
/* eslint-disable react-hooks/immutability, react-hooks/refs -- preserved Three.js scene lifecycle */

import { useRef } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import {
  DoubleSide,
  ShaderMaterial,
  MeshBasicMaterial,
  TextureLoader,
  SRGBColorSpace,
  RepeatWrapping,
  AdditiveBlending,
  Color,
  Vector2,
  Vector3,
  Sphere,
  Group,
  Mesh as ThreeMesh,
  SkinnedMesh,
  type Object3D,
} from "three";

const BASE = "/smg-assets/orbit-sky/";

const COMET_TEXTURES = [
  `${BASE}CometHalo.png`,       // 0
  `${BASE}IndBendMud.png`,      // 1
  `${BASE}AstroPlanetWall.png`, // 2
];

/* ------------------------------------------------------------------ */
/*  Shared vertex shader                                              */
/* ------------------------------------------------------------------ */
const baseVert = /* glsl */ `
  varying vec2 vUv;
  varying vec4 vColor;
  varying vec3 vLocalPos;
  void main() {
    vUv = uv;
    vColor = vec4(1.0);
    #if defined(USE_COLOR_ALPHA)
      vColor = color;
    #elif defined(USE_COLOR)
      vColor = vec4(color, 1.0);
    #endif
    vLocalPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* ------------------------------------------------------------------ */
/*  GLSL helper: apply offset + repeat + rotation to UVs              */
/* ------------------------------------------------------------------ */
const uvTransformGlsl = /* glsl */ `
  vec2 txUV(vec2 uv, vec2 offset, vec2 repeat, float rot) {
    float c = cos(rot);
    float s = sin(rot);
    vec2 centered = uv - 0.5;
    vec2 rotated = vec2(centered.x * c - centered.y * s,
                        centered.x * s + centered.y * c);
    return (rotated + 0.5) * repeat + offset;
  }
`;

/* ------------------------------------------------------------------ */
/*  Comet fragment shaders                                            */
/* ------------------------------------------------------------------ */

/** ACometHalo_v — large outer halo, additive glow */
const aCometHaloFrag = uvTransformGlsl + /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uTexOffset;
  uniform vec2 uTexRepeat;
  uniform float uTexRot;
  varying vec2 vUv;
  varying vec4 vColor;
  void main() {
    vec2 uv = txUV(vUv, uTexOffset, uTexRepeat, uTexRot);
    vec4 tex = texture2D(uTex, uv);
    vec3 rgb = tex.rgb * vColor.rgb;
    float lum = dot(rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(rgb, lum * vColor.a);
  }
`;

/** CometCoreMat_v_x — glowing core surface (teal↔purple lerp + vertex) */
const cometCoreFrag = uvTransformGlsl + /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uTexOffset;
  uniform vec2 uTexRepeat;
  uniform float uTexRot;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  varying vec4 vColor;
  void main() {
    vec2 uv = txUV(vUv, uTexOffset, uTexRepeat, uTexRot);
    vec4 tex = texture2D(uTex, uv);
    vec3 lerped = mix(uColorA, uColorB, tex.rgb);
    vec3 rgb = lerped + vColor.rgb;
    gl_FragColor = vec4(rgb, vColor.a);
  }
`;

/** CometHalo_v — inner wispy halo, two IndBendMud layers, additive */
const cometHaloFrag = uvTransformGlsl + /* glsl */ `
  uniform sampler2D uTex1;
  uniform vec2 uTex1Offset;
  uniform vec2 uTex1Repeat;
  uniform sampler2D uTex2;
  uniform vec2 uTex2Offset;
  uniform vec2 uTex2Repeat;
  varying vec2 vUv;
  varying vec4 vColor;
  void main() {
    vec2 uv1 = txUV(vUv, uTex1Offset, uTex1Repeat, 0.0);
    vec2 uv2 = txUV(vUv, uTex2Offset, uTex2Repeat, 0.0);
    vec4 t1 = texture2D(uTex1, uv1);
    vec4 t2 = texture2D(uTex2, uv2);
    vec3 rgb = (t1.rgb + t2.rgb) * vColor.rgb;
    float lum = dot(rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(rgb, lum * vColor.a);
  }
`;

/** CoreRock — untextured blue-tinted glowing rock */
const coreRockFrag = /* glsl */ `
  uniform vec3 uCoreColor;
  varying vec4 vColor;
  void main() {
    float a = clamp((1.0 - vColor.a) * 2.0, 0.0, 1.0);
    vec3 rgb = uCoreColor * a + vColor.rgb;
    gl_FragColor = vec4(rgb, 1.0);
  }
`;

/* ------------------------------------------------------------------ */
/*  Comet material names → material keys                              */
/* ------------------------------------------------------------------ */
const COMET_MAT_NAMES: Record<string, string> = {
  ACometHalo_v: "aCometHaloMat",
  CometCoreMat_v_x: "cometCoreMat",
  CometHalo_v: "cometHaloMat",
  CoreRock: "coreRockMat",
};

function resolveCometMatKey(name: string): string | undefined {
  const n = name.trim();
  if (COMET_MAT_NAMES[n]) return COMET_MAT_NAMES[n];
  const lower = n.toLowerCase();
  if (lower.includes("acomethalo")) return "aCometHaloMat";
  if (lower.includes("cometcore")) return "cometCoreMat";
  if (lower.includes("comethalo")) return "cometHaloMat";
  if (lower.includes("corerock")) return "coreRockMat";
  return undefined;
}

/* ------------------------------------------------------------------ */
/*  Comet material factory (useRef lazy-init to survive Strict Mode)  */
/* ------------------------------------------------------------------ */
type CometMats = {
  aCometHaloMat: ShaderMaterial;
  cometCoreMat: ShaderMaterial;
  cometHaloMat: ShaderMaterial;
  coreRockMat: ShaderMaterial;
};

function useCometMaterials(): CometMats {
  const textures = useLoader(TextureLoader, COMET_TEXTURES);
  const matsRef = useRef<CometMats | null>(null);

  if (matsRef.current === null) {
    const [cometHaloTex, indBendMud, astroPlanet] = textures;

    for (const t of textures) {
      t.wrapS = RepeatWrapping;
      t.wrapT = RepeatWrapping;
      t.colorSpace = SRGBColorSpace;
    }

    // ACometHalo_v — outer halo
    const aCometHaloMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: aCometHaloFrag,
      uniforms: {
        uTex: { value: cometHaloTex },
        uTexOffset: { value: new Vector2(0, 0.534) },
        uTexRepeat: { value: new Vector2(4, -3) },
        uTexRot: { value: 0.084 },
      },
      side: DoubleSide,
      depthWrite: false,
      transparent: true,
      blending: AdditiveBlending,
      vertexColors: true,
    });

    // CometCoreMat_v_x — core surface
    const cometCoreMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: cometCoreFrag,
      uniforms: {
        uTex: { value: astroPlanet },
        uTexOffset: { value: new Vector2(0, -8.779) },
        uTexRepeat: { value: new Vector2(2, 2.319) },
        uTexRot: { value: 0.061 },
        uColorA: { value: new Color(8 / 255, 77 / 255, 93 / 255) },
        uColorB: { value: new Color(135 / 255, 82 / 255, 244 / 255) },
      },
      side: DoubleSide,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    });

    // CometHalo_v — inner halo (two IndBendMud layers)
    const cometHaloMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: cometHaloFrag,
      uniforms: {
        uTex1: { value: indBendMud },
        uTex1Offset: { value: new Vector2(0, 8.283) },
        uTex1Repeat: { value: new Vector2(6, -1) },
        uTex2: { value: indBendMud },
        uTex2Offset: { value: new Vector2(0, 0) },
        uTex2Repeat: { value: new Vector2(2.456, 0.415) },
      },
      side: DoubleSide,
      depthWrite: false,
      transparent: true,
      blending: AdditiveBlending,
      vertexColors: true,
    });

    // CoreRock — untextured blue-tinted rock
    const coreRockMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: coreRockFrag,
      uniforms: {
        uCoreColor: { value: new Color(93 / 255, 185 / 255, 255 / 255) },
      },
      side: DoubleSide,
      depthWrite: false,
      vertexColors: true,
    });

    matsRef.current = { aCometHaloMat, cometCoreMat, cometHaloMat, coreRockMat };
  }

  return matsRef.current;
}

/* ------------------------------------------------------------------ */
/*  Comet component                                                   */
/* ------------------------------------------------------------------ */
interface CometProps {
  sunDir?: Vector2;
}

export default function Comet({ sunDir }: CometProps) {
  const sceneRef = useRef<Object3D | null>(null);
  const cometCollada = useLoader(ColladaLoader, `${BASE}CometNearOrbitSky.dae`);
  const mats = useCometMaterials();

  // Lazy-init: extract comet geometry from the COLLADA SkinnedMeshes and
  // rebuild as plain Mesh objects. The COLLADA has skinned meshes bound to a
  // bone hierarchy — SkinnedMesh uses GPU-side bone transforms, but the CPU
  // bounding sphere is computed from bind-pose vertices. This causes Three.js
  // frustum culling to incorrectly hide meshes at certain camera angles.
  // Converting to plain Mesh eliminates all skeleton/bounding issues.
  if (sceneRef.current === null && cometCollada?.scene) {
    const group = new Group();
    const scale = 1 / 500;
    group.scale.set(scale, scale, scale);

    const sd = sunDir ?? new Vector2(0, 1);
    group.position.set(sd.x * 120, 25, sd.y * 120);

    // Walk the loaded scene graph and collect comet meshes
    cometCollada.scene.traverse((child) => {
      // Accept both SkinnedMesh and regular Mesh
      if (!(child instanceof SkinnedMesh) && !(child instanceof ThreeMesh)) return;
      const src = child as ThreeMesh;

      const matName = Array.isArray(src.material)
        ? src.material.map((m) => (m?.name ?? "").trim()).filter(Boolean).join("|")
        : ((src.material as MeshBasicMaterial)?.name ?? "").trim();

      const matKey = resolveCometMatKey(matName);
      if (!matKey || !mats[matKey as keyof typeof mats]) return; // skip non-comet

      // Clone geometry so we own it — the shared COLLADA geometry can have its
      // bounding sphere computed/cached elsewhere, causing stale culling data.
      // Force an enormous bounding sphere so frustum culling never triggers.
      const geo = src.geometry.clone();
      geo.boundingSphere = new Sphere(new Vector3(), 1e10);

      const plainMesh = new ThreeMesh(geo, mats[matKey as keyof typeof mats]);
      plainMesh.frustumCulled = false;

      group.add(plainMesh);
    });

    sceneRef.current = group;
  }

  // Animate comet textures via uniforms — ShaderMaterial ignores texture.offset
  useFrame((_, delta) => {
    const u = mats.cometHaloMat.uniforms;
    // Inner halo layer 1 — primary tail streaks
    u.uTex1Offset.value.y += delta * 0.1;
    u.uTex1Offset.value.x += delta * 0.1;
    // Inner halo layer 2 — secondary wisps
    u.uTex2Offset.value.x += delta * 0.1;
    u.uTex2Offset.value.y += delta * 0.1;

    // Outer halo — large diffuse glow streaming
    const ah = mats.aCometHaloMat.uniforms;
    ah.uTexOffset.value.y += delta * 0.1;
    ah.uTexOffset.value.x += delta * 0.04;

    // Core surface — energy flowing across rock
    const core = mats.cometCoreMat.uniforms;
    core.uTexOffset.value.y += delta * 0.1;
    core.uTexOffset.value.x += delta * 0.1;
  });

  if (!sceneRef.current) return null;
  return <primitive object={sceneRef.current} />;
}
