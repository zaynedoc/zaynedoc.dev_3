"use client";
/* eslint-disable react-hooks/immutability, react-hooks/purity, react-hooks/refs -- preserved Three.js scene lifecycle */

import { useRef, useMemo, useEffect } from "react";
import { useLoader, useFrame } from "@react-three/fiber";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader.js";
import {
  DoubleSide,
  FrontSide,
  ShaderMaterial,
  MeshBasicMaterial,
  TextureLoader,
  SRGBColorSpace,
  RepeatWrapping,
  ClampToEdgeWrapping,
  LinearFilter,
  AdditiveBlending,
  CustomBlending,
  ZeroFactor,
  SrcColorFactor,
  OneFactor,
  Color,
  Matrix3,
  CircleGeometry,
  Vector2,
  Vector3,
  Mesh as ThreeMesh,
  type Mesh,
  type Object3D,
} from "three";

const BASE = "/smg-assets/orbit-sky/";

/** Stable module-scope array prevents useLoader identity churn across renders */
const TEXTURE_URLS = [
  `${BASE}OrbitUniverseL.png`,  // 0
  `${BASE}Galaxy.png`,          // 1
  `${BASE}GalaxyRiverK.png`,    // 2
  `${BASE}Skyk.png`,            // 3
  `${BASE}PlanetSun.png`,       // 4
  `${BASE}EarthKsMM.png`,       // 5
  `${BASE}NightCityk.png`,      // 6
  `${BASE}Cloud01k.png`,        // 7
  `${BASE}EarthFarK.png`,       // 8
  `${BASE}AstroPlanetWall.png`, // 9
  `${BASE}HorizonBlur.png`,     // 10
  `${BASE}EdgeBlur.png`,        // 11
];

/* ------------------------------------------------------------------ */
/*  Custom GLSL shaders replicating the Wii TEV blending pipeline     */
/*  Vertex colors are grayscale luminance gradients baked into the     */
/*  mesh — they control per-vertex brightness/blending, not hue.      */
/* ------------------------------------------------------------------ */

/** Shared vertex shader — passes UV and vertex color */
const baseVert = /* glsl */ `
  varying vec2 vUv;
  varying vec4 vColor;
  varying vec3 vLocalPos;
  varying vec2 vScreenUv;
  void main() {
    vUv = uv;
    vColor = vec4(1.0);
    #if defined(USE_COLOR_ALPHA)
      vColor = color;
    #elif defined(USE_COLOR)
      vColor = vec4(color, 1.0);
    #endif
    vLocalPos = position;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vec4 clipPos = projectionMatrix * mvPos;
    vScreenUv = clipPos.xy / clipPos.w * 0.5 + 0.5;
    gl_Position = clipPos;
  }
`;

/**
 * Sky_Mat_v — atmosphere gradient band
 * Step: RGB = lerp(uConstant, vColor.rgb * uMatColor, tex.rgb) * 2
 * Constant: (0, 28, 43)/255 = dark teal
 * Material color: (149, 195, 165)/255 = mint green
 * Opaque band — dark teal at top matches space, bright teal at bottom meets earth.
 */
const skyFrag = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec3 uConstant;  // (0, 28, 43)
  uniform vec3 uMatColor;  // (149, 195, 165)
  uniform vec3 uSpaceColor; // (0, 57, 88)
  uniform vec2 uSunDir;    // normalized XZ direction toward sun
  varying vec2 vUv;
  varying vec4 vColor;
  varying vec3 vLocalPos;
  void main() {
    vec4 tex = texture2D(uTex, vUv);
    float vc = vColor.r;
    // Radial sun factor: 1.0 facing sun, 0.0 on backside
    float rawDot = dot(normalize(vLocalPos.xz), uSunDir);
    float sunFace = rawDot * 0.4 + 0.5; // remap -1..1 to 0..1
    sunFace = pow(sunFace, 1.5); // gentle radial falloff
    // Tighter band — fade concentrates in the lower portion of the dome.
    // Start below 0 so the very bottom vertices still carry atmosphere color,
    // hiding the seam where the dome meets the horizon planes.
    float band = smoothstep(-0.15, 1.4, vc);
    // Add a small ambient floor so backside still shows a faint teal rim
    float bandFaced = band * max(sunFace, 0.25);
    vec3 horizonColor = mix(uSpaceColor, uMatColor, 1.0);
    vec3 base = mix(uSpaceColor, horizonColor, bandFaced);
    // Tighter, brighter glow right at the horizon
    float glow = smoothstep(0.6, 1.0, vc);
    base += tex.rgb * glow * uMatColor * 0.9 * sunFace;
    gl_FragColor = vec4(base, 1.0);
  }
`;

/**
 * Space_Mat_v — star field with galaxy & milky way overlaid
 * Step 1: Galaxy * vColor + constant
 * Step 2: vColor * OrbitUniverseL + prev
 * Step 3: vColor * GalaxyRiverK + prev
 * Constant: (0, 57, 88)/255 = deep blue
 */
const spaceFrag = /* glsl */ `
  uniform sampler2D uTex1;   // OrbitUniverseL
  uniform sampler2D uTex2;   // Galaxy
  uniform sampler2D uTex3;   // GalaxyRiverK
  uniform vec3 uConstant;    // (0, 57, 88)
  uniform mat3 uUvXform2;    // Galaxy UV transform
  uniform mat3 uUvXform3;    // GalaxyRiver UV transform
  uniform float uStarBoost;  // star brightness multiplier
  varying vec2 vUv;
  varying vec4 vColor;
  void main() {
    vec2 uv2 = (uUvXform2 * vec3(vUv, 1.0)).xy;
    vec2 uv3 = (uUvXform3 * vec3(vUv, 1.0)).xy;
    vec4 t1 = texture2D(uTex1, vUv);
    vec4 t2 = texture2D(uTex2, uv2);
    vec4 t3 = texture2D(uTex3, uv3);
    // Step 1: galaxy * vertex + constant
    vec3 rgb = t2.rgb * vColor.rgb + uConstant;
    // Step 2: vertex * stars + prev (boosted)
    rgb = vColor.rgb * t1.rgb * uStarBoost + rgb;
    // Step 3: vertex * river + prev
    rgb = vColor.rgb * t3.rgb * 1.3 + rgb;
    float a = t2.a * vColor.a;
    gl_FragColor = vec4(rgb, 1.0);
  }
`;

/**
 * EarthFar_v — planet dayside with atmosphere edge tint
 * Step 1: vColor * EarthKsMM
 * Step 2: lerp(darkBlue, teal, EarthFarK) + prev
 * Constant: (65, 213, 209)/255 = teal
 * Color register: (0, 25, 52)/255 = dark navy
 * (Clouds are now rendered on a separate 3D plane)
 */
const earthFarFrag = /* glsl */ `
  uniform vec2 uSunDir;
  uniform vec3 uDarkColor;
  varying vec4 vColor;
  varying vec3 vLocalPos;
  void main() {
    float rawDot = dot(normalize(vLocalPos.xz), uSunDir);
    float sunFace = pow(rawDot * 0.5 + 0.5, 1.5);
    gl_FragColor = vec4(mix(uDarkColor, vec3(1.0), sunFace), 1.0);
  }
`;

/**
 * EarthNightMat_v — dark side with navy tint
 * Step 1: EarthKsMM * vColor + constant
 * (Clouds are now rendered on a separate 3D plane)
 */
const earthNightFrag = /* glsl */ `
  uniform vec2 uSunDir;
  uniform vec3 uDarkColor;
  varying vec4 vColor;
  varying vec3 vLocalPos;
  void main() {
    float rawDot = dot(normalize(vLocalPos.xz), uSunDir);
    float sunFace = pow(rawDot * 0.5 + 0.5, 1.5);
    gl_FragColor = vec4(mix(uDarkColor, vec3(1.0), sunFace), 1.0);
  }
`;

/**
 * Sun_Mat_v — texture * vertex color, additive blending (black = transparent)
 */
const sunFrag = /* glsl */ `
  uniform sampler2D uTex;
  varying vec2 vUv;
  varying vec4 vColor;
  void main() {
    vec4 tex = texture2D(uTex, vUv);
    vec3 rgb = tex.rgb * vColor.rgb;
    // Luminance drives alpha so black bg vanishes under additive blend
    float lum = dot(rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(rgb, lum);
  }
`;

/**
 * CityLight_Mat_v — orange city lights: texture * vertex color
 * Material color: (255, 150, 0)/255
 */
const cityFrag = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec3 uMatColor;
  varying vec2 vUv;
  varying vec4 vColor;
  void main() {
    vec4 tex = texture2D(uTex, vUv);
    gl_FragColor = vec4(tex.rgb * vColor.rgb * uMatColor, tex.a * vColor.a);
  }
`;

/**
 * CityPlane_Mat — city lights only visible on the night side of the planet.
 * Uses sun direction to fade lights out on the sun-facing half.
 */
const cityPlaneFrag = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec3 uMatColor;
  uniform vec2 uSunDir;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vLocalPos;
  void main() {
    vec4 tex = texture2D(uTex, vUv);
    // Sun-facing factor from local XZ position
    vec2 localDir = normalize(vLocalPos.xz + vec2(1e-5, 0.0));
    float sunFace = dot(localDir, normalize(uSunDir));
    // Visible only on the night side (opposite to sun)
    float nightMask = smoothstep(0.1, -0.3, sunFace);
    vec3 rgb = tex.rgb * uMatColor * nightMask;
    float a = tex.a * uOpacity * nightMask;
    gl_FragColor = vec4(rgb, a);
  }
`;

/**
 * HorizonHaze — radial cyan fade toward the vanishing point.
 * Center of the plane is fully transparent; edges blend to a light cyan.
 */
const horizonHazeFrag = /* glsl */ `
  uniform vec3 uHazeColor;
  uniform float uInnerRadius;
  uniform float uOuterRadius;
  uniform float uStrength;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float haze = smoothstep(uInnerRadius, uOuterRadius, r);
    float alpha = haze * uStrength;
    gl_FragColor = vec4(uHazeColor, alpha);
  }
`;

/**
 * SunShadow_Mat_v — darkening pass for the side opposite the sun.
 * Uses horizon ring mask (from UV radius) and sun-opposed factor (from local XZ).
 */
const sunShadowFrag = /* glsl */ `
  uniform vec2 uSunDir;
  uniform vec3 uShadowColor;
  uniform float uStrength;
  varying vec2 vUv;
  varying vec3 vLocalPos;
  void main() {
    // Direction on the plane relative to sun
    vec2 localDir = normalize(vLocalPos.xz + vec2(1e-5, 0.0));
    float sunFace = dot(localDir, normalize(uSunDir));
    // Smooth ramp: 1.0 on sun side → 0.0 on opposite side
    float lit = smoothstep(-0.5, 0.15, sunFace);
    // Multiply blend: white = no change, shadowColor = darkens framebuffer
    vec3 col = mix(uShadowColor, vec3(1.0), lit);
    // Strength controls how dark the shadow side gets (lower = darker)
    col = mix(vec3(1.0), col, uStrength);
    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ------------------------------------------------------------------ */
/*  Build UV transform matrix for rotated/scaled/offset texture reads */
/* ------------------------------------------------------------------ */
function uvMatrix(
  sx: number, sy: number,
  ox: number, oy: number,
  rot: number
): Matrix3 {
  const c = Math.cos(rot), s = Math.sin(rot);
  // Scale → Rotate → Translate
  const m = new Matrix3();
  m.set(
    sx * c,  sx * -s, ox,
    sy * s,  sy *  c, oy,
    0,       0,       1
  );
  return m;
}

/* ------------------------------------------------------------------ */
/*  Material factory using CometNearOrbitSky color palette            */
/* ------------------------------------------------------------------ */
function useOrbitMaterials() {
  const textures = useLoader(TextureLoader, TEXTURE_URLS);

  return useMemo(() => {
    const [orbitUniv, galaxy, galaxyRiver, sky, sun, earthKs, nightCity, cloud, earthFar, astroPlanet, horizonBlur, edgeBlur] = textures;

    for (const t of textures) {
      t.wrapS = RepeatWrapping;
      t.wrapT = RepeatWrapping;
      t.colorSpace = SRGBColorSpace;
    }

    // --- Sky_Mat_v --- opaque band between space and earth
    sky.repeat.set(0, 0);
    const skyMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: skyFrag,
      uniforms: {
        uTex: { value: sky },
        uConstant: { value: new Color(0 / 255, 28 / 255, 43 / 255) },
        uMatColor: { value: new Color(149 / 255, 220 / 255, 200 / 255) },
        uSpaceColor: { value: new Color(0 / 255, 57 / 255, 88 / 255) },
        uSunDir: { value: new Vector2(0, -1) },
      },
      side: DoubleSide,
      depthWrite: false,
      vertexColors: true,
    });

    // --- Space_Mat_v ---
    orbitUniv.repeat.set(0.5, 1);
    const galaxyUvMat = uvMatrix(0.249, 0.288, -0.288, 0, 0.52);
    const riverUvMat = uvMatrix(0.537, 0.576, 1.035, 0, 0.248);
    const spaceMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: spaceFrag,
      uniforms: {
        uTex1: { value: orbitUniv },
        uTex2: { value: galaxy },
        uTex3: { value: galaxyRiver },
        uConstant: { value: new Color(0 / 255, 57 / 255, 88 / 255) },
        uUvXform2: { value: galaxyUvMat },
        uUvXform3: { value: riverUvMat },
        uStarBoost: { value: 2.5 },
      },
      side: DoubleSide,
      depthWrite: false,
      vertexColors: true,
    });

    // --- Sun_Mat_v --- additive so black bg = transparent
    sun.repeat.set(1.113, 1.113);
    const sunMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: sunFrag,
      uniforms: { uTex: { value: sun } },
      side: DoubleSide,
      depthWrite: false,
      transparent: true,
      blending: AdditiveBlending,
      vertexColors: true,
    });

    // --- EarthFar_v (white on sun side, dark navy on backside) ---
    const earthFarMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: earthFarFrag,
      uniforms: {
        uSunDir: { value: new Vector2(0, 1) },
        uDarkColor: { value: new Color(0 / 255, 25 / 255, 52 / 255) },
      },
      side: DoubleSide,
      depthWrite: false,
      vertexColors: true,
    });

    // --- EarthNightMat_v (white on sun side, dark navy on backside) ---
    const earthNightMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: earthNightFrag,
      uniforms: {
        uSunDir: { value: new Vector2(0, 1) },
        uDarkColor: { value: new Color(0 / 255, 25 / 255, 52 / 255) },
      },
      side: DoubleSide,
      depthWrite: false,
      vertexColors: true,
    });

    // --- CityLight_Mat_v ---
    const cityMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: cityFrag,
      uniforms: {
        uTex: { value: nightCity },
        uMatColor: { value: new Color(255 / 255, 150 / 255, 0 / 255) },
      },
      side: DoubleSide,
      depthWrite: false,
      transparent: true,
      blending: AdditiveBlending,
      vertexColors: true,
    });

    // --- Cloud plane material (additive, separate 3D plane) ---
    cloud.repeat.set(6, 6);
    const cloudMat = new MeshBasicMaterial({
      map: cloud,
      side: DoubleSide,
      depthWrite: false,
      transparent: true,
      blending: AdditiveBlending,
      opacity: 0.75,
    });

    // --- Earth plane material (AstroPlanetWall, slower scroll than clouds) ---
    const astroPlaneTex = astroPlanet.clone();
    astroPlaneTex.wrapS = RepeatWrapping;
    astroPlaneTex.wrapT = RepeatWrapping;
    astroPlaneTex.repeat.set(5, 5);
    const earthPlaneMat = new MeshBasicMaterial({
      map: astroPlaneTex,
      side: DoubleSide,
      depthWrite: false,
      transparent: true,
      blending: AdditiveBlending,
      opacity: 0.75,
    });

    // --- City lights plane material (additive, night-side only) ---
    const cityPlaneTex = nightCity.clone();
    cityPlaneTex.wrapS = RepeatWrapping;
    cityPlaneTex.wrapT = RepeatWrapping;
    cityPlaneTex.repeat.set(15, 15);
    cityPlaneTex.offset.set(Math.random() * 100, Math.random() * 100);
    const cityPlaneMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: cityPlaneFrag,
      uniforms: {
        uTex: { value: cityPlaneTex },
        uMatColor: { value: new Color(255 / 255, 150 / 255, 0 / 255) },
        uSunDir: { value: new Vector2(0, 1) },
        uOpacity: { value: 0.7 },
      },
      side: FrontSide,
      depthWrite: false,
      transparent: true,
      blending: AdditiveBlending,
    });

    // --- Horizon blur plane material (static cyan band near vanishing point) ---
    const horizonBlurTex = horizonBlur.clone();
    horizonBlurTex.wrapS = ClampToEdgeWrapping;
    horizonBlurTex.wrapT = ClampToEdgeWrapping;
    horizonBlurTex.repeat.set(1, 1);
    horizonBlurTex.generateMipmaps = false;
    horizonBlurTex.minFilter = LinearFilter;
    horizonBlurTex.magFilter = LinearFilter;
    horizonBlurTex.needsUpdate = true;
    const horizonBlurMat = new MeshBasicMaterial({
      map: horizonBlurTex,
      side: DoubleSide,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      blending: AdditiveBlending,
      opacity: 0.95,
    });

    // --- Edge blur plane material (top-most static blend mask near sun side) ---
    const edgeBlurTex = edgeBlur.clone();
    edgeBlurTex.wrapS = ClampToEdgeWrapping;
    edgeBlurTex.wrapT = ClampToEdgeWrapping;
    edgeBlurTex.repeat.set(1, 1);
    edgeBlurTex.center.set(0.5, 0.5);
    edgeBlurTex.generateMipmaps = false;
    edgeBlurTex.minFilter = LinearFilter;
    edgeBlurTex.magFilter = LinearFilter;
    edgeBlurTex.premultiplyAlpha = true;
    edgeBlurTex.needsUpdate = true;
    const edgeBlurMat = new MeshBasicMaterial({
      map: edgeBlurTex,
      side: DoubleSide,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      opacity: 0.95,
    });

    // --- Horizon haze plane material (radial cyan fade toward vanishing point) ---
    const horizonHazeMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: horizonHazeFrag,
      uniforms: {
        uHazeColor: { value: new Color(140 / 255, 220 / 255, 235 / 255) },
        uInnerRadius: { value: 0.25 },
        uOuterRadius: { value: 0.92 },
        uStrength: { value: 0.7 },
      },
      side: DoubleSide,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      blending: AdditiveBlending,
      vertexColors: false,
    });

    // --- Sun-opposed darkening plane material (custom multiply dark pass) ---
    const sunShadowMat = new ShaderMaterial({
      vertexShader: baseVert,
      fragmentShader: sunShadowFrag,
      uniforms: {
        uSunDir: { value: new Vector2(1, 0) },
        uShadowColor: { value: new Color(0 / 255, 22 / 255, 48 / 255) },
        uStrength: { value: 0.0 },
      },
      side: DoubleSide,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      // Custom blend: result = framebuffer * srcColor + 0
      // srcColor = white on sun side (no change), dark on opposite (darkens)
      blending: CustomBlending,
      blendSrc: ZeroFactor,
      blendDst: SrcColorFactor,
      blendSrcAlpha: OneFactor,
      blendDstAlpha: ZeroFactor,
      vertexColors: false,
    });

    // --- Dark blue base plane (original earth color, below all other planes) ---
    const basePlaneMat = new MeshBasicMaterial({
      color: new Color(0 / 255, 25 / 255, 52 / 255),
      side: DoubleSide,
      depthWrite: false,
    });

    return { skyMat, spaceMat, sunMat, earthFarMat, earthNightMat, cityMat, cloudMat, earthPlaneMat, cityPlaneMat, horizonBlurMat, edgeBlurMat, horizonHazeMat, sunShadowMat, basePlaneMat };
  }, [textures]);
}

/** Map COLLADA material names → our custom shader material keys */
const MAT_NAME_MAP: Record<string, string> = {
  EarthFar_v: "earthFarMat",
  EarthNightMat_v: "earthNightMat",
  Sun_Mat_v: "sunMat",
  Space_Mat_v: "spaceMat",
  Sky_Mat_v: "skyMat",
  CityLight_Mat_v: "cityMat",
};

function resolveMatKey(name: string): string | undefined {
  const n = name.trim();
  if (MAT_NAME_MAP[n]) return MAT_NAME_MAP[n];

  const lower = n.toLowerCase();
  if (lower.includes("earthfar")) return "earthFarMat";
  if (lower.includes("earthnight")) return "earthNightMat";
  if (lower.includes("citylight") || lower.includes("nightcity")) return "cityMat";
  if (lower.includes("space")) return "spaceMat";
  if (lower.includes("sky")) return "skyMat";
  if (lower.includes("sun")) return "sunMat";

  return undefined;
}

export default function OrbitSky({ onReady }: { onReady?: () => void }) {
  const groupRef = useRef<Object3D>(null);
  const spaceMeshRefs = useRef<Mesh[]>([]);
  const sunDirRef = useRef(new Vector2(0, 1));
  const sceneRef = useRef<Object3D | null>(null);
  const collada = useLoader(ColladaLoader, `${BASE}VROrbit.dae`);
  const mats = useOrbitMaterials();

  // Lazy-init: create the processed scene exactly once.
  // Using a ref instead of useMemo prevents React Strict Mode / dependency
  // identity churn from recreating the clone every render (which resets rotation).
  if (sceneRef.current === null && collada?.scene) {
    const scene = collada.scene.clone(true);
    spaceMeshRefs.current = [];

    // Model coords are ~800k centimeters — normalize
    const scale = 1 / 500;
    scene.scale.set(scale, scale, scale);
    // Shift the dome down so its lower rim sits at the planes' vanishing horizon,
    // closing the empty band that would otherwise show between sky and ground planes.
    scene.position.y = -27;

    scene.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;

      const matNames = Array.isArray(mesh.material)
        ? mesh.material.map((m) => (m?.name ?? "").trim()).filter(Boolean).join("|")
        : ((mesh.material as MeshBasicMaterial)?.name ?? "").trim();
      const meshName = mesh.name ?? "";
      const matKey = resolveMatKey(matNames);
      const isSpaceLike = /space/i.test(matNames) || /space/i.test(meshName);

      if (matKey || isSpaceLike) {
        const resolvedKey = matKey ?? "spaceMat";
        mesh.material = mats[resolvedKey as keyof typeof mats];
        if (resolvedKey === "spaceMat" || isSpaceLike) {
          spaceMeshRefs.current.push(mesh);
        }
        // Compute sun direction from the sun mesh's geometry centroid
        if (resolvedKey === "sunMat") {
          const geo = mesh.geometry;
          geo.computeBoundingBox();
          if (geo.boundingBox) {
            const center = new Vector3();
            geo.boundingBox.getCenter(center);
            const len = Math.sqrt(center.x * center.x + center.z * center.z);
            if (len > 0.001) {
              sunDirRef.current.set(center.x / len, center.z / len);
            }
          }
        }
      } else {
        const origMat = mesh.material as MeshBasicMaterial;
        if (origMat?.side !== undefined) origMat.side = DoubleSide;
      }
    });

    sceneRef.current = scene;
  }

  const processedScene = sceneRef.current;

  // Signal to parent that the scene is ready (for fade-in)
  useEffect(() => {
    if (processedScene) onReady?.();
  }, [processedScene, onReady]);

  // Layered circular planes at the horizon.
  // Adjust these offsets to control stacking and blending order.
  const { cloudPlane, earthPlane, cityPlane, horizonBlurPlane, edgeBlurPlane, horizonHazePlane, sunShadowPlane, basePlane } = useMemo(() => {
    const planeY = -17190 / 500 + 8; // horizon seam
    const radius = 700;
    const planeOffsets = {
      base: -2,
      earth: -1,
      city: -0.5,
      cloud: 0.5,
      horizonBlur: 0.5,
      horizonHaze: 0.5,
      edgeBlur: 0.5,
      sunShadow: 0.5,
    };

    // Dark blue base plane (bottom-most)
    const baseGeo = new CircleGeometry(radius, 64);
    const base = new ThreeMesh(baseGeo, mats.basePlaneMat);
    base.rotation.x = -Math.PI / 2;
    base.position.y = planeY + planeOffsets.base;
    base.renderOrder = 10;

    // Earth/AstroPlanet plane (just below clouds)
    const earthGeo = new CircleGeometry(radius, 64);
    const earth = new ThreeMesh(earthGeo, mats.earthPlaneMat);
    earth.rotation.x = -Math.PI / 2;
    earth.position.y = planeY + planeOffsets.earth;
    earth.renderOrder = 20;

    // City lights plane (middle, randomized XZ offset)
    const cityGeo = new CircleGeometry(radius, 64);
    const city = new ThreeMesh(cityGeo, mats.cityPlaneMat);
    city.rotation.x = -Math.PI / 2;
    city.position.y = planeY + planeOffsets.city;
    city.renderOrder = 30;
    // Randomize position so city lights don't align with the other planes
    city.position.x = (Math.random() - 0.5) * 200;
    city.position.z = (Math.random() - 0.5) * 200;

    // Cloud plane (top)
    const cloudGeo = new CircleGeometry(radius, 64);
    const cloud = new ThreeMesh(cloudGeo, mats.cloudMat);
    cloud.rotation.x = -Math.PI / 2;
    cloud.position.y = planeY + planeOffsets.cloud;
    cloud.renderOrder = 40;

    // Horizon blur overlay plane (top-most, static texture)
    const horizonBlurGeo = new CircleGeometry(radius, 64);
    const horizonBlur = new ThreeMesh(horizonBlurGeo, mats.horizonBlurMat);
    horizonBlur.rotation.x = -Math.PI / 2;
    horizonBlur.position.y = planeY + planeOffsets.horizonBlur;
    horizonBlur.renderOrder = 50;

    // Horizon haze plane (radial cyan fade toward vanishing point)
    const horizonHazeGeo = new CircleGeometry(radius, 64);
    const horizonHazePlane = new ThreeMesh(horizonHazeGeo, mats.horizonHazeMat);
    horizonHazePlane.rotation.x = -Math.PI / 2;
    horizonHazePlane.position.y = planeY + planeOffsets.horizonHaze;
    horizonHazePlane.renderOrder = 55;

    // Edge blur overlay (highest layer, static image)
    // Slightly oversized to cover seam lines from inner horizon layers.
    const edgeBlurGeo = new CircleGeometry(radius * 1.00, 64);
    const edgeBlurPlane = new ThreeMesh(edgeBlurGeo, mats.edgeBlurMat);
    edgeBlurPlane.rotation.x = -Math.PI / 2;
    edgeBlurPlane.position.y = planeY + planeOffsets.edgeBlur;
    edgeBlurPlane.renderOrder = 60;

    // Sun-opposed radial darkening overlay (highest layer)
    const sunShadowGeo = new CircleGeometry(radius, 64);
    const sunShadowPlane = new ThreeMesh(sunShadowGeo, mats.sunShadowMat);
    sunShadowPlane.rotation.x = -Math.PI / 2;
    sunShadowPlane.position.y = planeY + planeOffsets.sunShadow;
    sunShadowPlane.renderOrder = 70;
    sunShadowPlane.frustumCulled = false;

    return { cloudPlane: cloud, earthPlane: earth, cityPlane: city, horizonBlurPlane: horizonBlur, edgeBlurPlane, horizonHazePlane, sunShadowPlane, basePlane: base };
  }, [mats.cloudMat, mats.earthPlaneMat, mats.cityPlaneMat, mats.horizonBlurMat, mats.edgeBlurMat, mats.horizonHazeMat, mats.sunShadowMat, mats.basePlaneMat]);

  // Rotate space meshes, scroll plane textures, update sun direction uniforms
  useFrame((state, delta) => {
    if (spaceMeshRefs.current.length > 0) {
      for (const mesh of spaceMeshRefs.current) {
        mesh.rotation.y += delta * 0.03;
      }
    } else if (sceneRef.current) {
      // Fallback: rotate entire dome when no individual space meshes were matched.
      sceneRef.current.rotation.y += delta * 0.03;
    }

    // Update sun direction on COLLADA shader materials
    const sd = sunDirRef.current;
    (mats.skyMat as ShaderMaterial).uniforms.uSunDir.value.copy(sd);
    (mats.earthFarMat as ShaderMaterial).uniforms.uSunDir.value.copy(sd);
    (mats.earthNightMat as ShaderMaterial).uniforms.uSunDir.value.copy(sd);
    (mats.sunShadowMat as ShaderMaterial).uniforms.uSunDir.value.copy(sd);
    (mats.cityPlaneMat as ShaderMaterial).uniforms.uSunDir.value.copy(sd);

    // Scroll plane textures
    const cloudMap = (mats.cloudMat as MeshBasicMaterial).map;
    if (cloudMap) cloudMap.offset.y += delta * 0.030;
    const earthMap = (mats.earthPlaneMat as MeshBasicMaterial).map;
    if (earthMap) earthMap.offset.y += delta * 0.004;
    const cityMap = (mats.cityPlaneMat as ShaderMaterial).uniforms.uTex?.value;
    if (cityMap) cityMap.offset.y += delta * 0.007;

    // Keep edge blur dip oriented toward the sun side; no scrolling animation.
    const edgeBlurMap = (mats.edgeBlurMat as MeshBasicMaterial).map;
    if (edgeBlurMap) {
      const sunAngle = Math.atan2(sd.y, sd.x);
      edgeBlurMap.rotation = -sunAngle - Math.PI / 2;
    }
  });

  if (!processedScene) return null;
  return (
    <group ref={groupRef}>
      <primitive object={processedScene} />
      <primitive object={basePlane} />
      <primitive object={earthPlane} />
      <primitive object={cityPlane} />
      <primitive object={cloudPlane} />
      <primitive object={horizonBlurPlane} />
      <primitive object={horizonHazePlane} />
      <primitive object={edgeBlurPlane} />
      <primitive object={sunShadowPlane} />
    </group>
  );
}
