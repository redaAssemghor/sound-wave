"use client";

import { useEffect, useRef, useState, MutableRefObject } from "react";
import * as THREE from "three";

export type VisualSettings = {
  shape: string;
  color: string;
  sensitivity: number;
  speed: number;
  wireframe: boolean;
  particles: boolean;
};

const vertexShader = `
  uniform float uTime;
  uniform float uBass;
  uniform float uMid;
  uniform float uHigh;
  uniform float uKind;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 p = position;
    if (uKind < 0.5) {
      // Position-based deformation keeps the sphere seam continuous.
      float petals = sin(p.x * 3.1 + uTime * 0.7)
        * cos(p.y * 3.4 - uTime * 0.8)
        * sin(p.z * 3.1 + uTime * 0.5);
      float ripple = sin(p.y * 7.0 + p.x * 2.0 - uTime * 1.6);
      p += normal * (petals * (0.13 + uBass * 0.33)
        + ripple * (0.018 + uMid * 0.055));
      p *= 1.0 + uBass * 0.09;
    } else if (uKind < 1.5) {
      p += normal * sin(p.y * 5.0 + p.x * 3.0 - uTime * 1.5)
        * (0.018 + uMid * 0.09);
      float twist = sin(uTime * 0.45) * 0.10 + uBass * 0.12;
      float a = p.y * twist;
      p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
      p *= 1.0 + uBass * 0.10;
    } else {
      p *= 1.0 + uBass * 0.08;
    }
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    vPosition = p;
    vNormal = normalize(normalMatrix * normal);
    vView = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uTime;
  uniform float uBass;
  uniform float uMid;
  uniform float uHigh;
  uniform float uContours;
  uniform float uKind;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 n = normalize(vNormal);
    if (uKind > 1.5) n = normalize(cross(dFdx(vView), dFdy(vView)));
    vec3 eye = normalize(vView);
    float facing = abs(dot(n, eye));
    float rim = pow(1.0 - facing, 2.4);
    vec3 light = normalize(vec3(-0.7, 1.0, 1.3));
    float diffuse = max(dot(n, light), 0.0);
    float highlight = pow(max(dot(n, normalize(light + eye)), 0.0), 65.0);
    float ribbon = sin(vPosition.y * 4.5 + vPosition.x * 2.0
      + vPosition.z * 2.8 - uTime * 0.55) * 0.5 + 0.5;
    vec3 tint = mix(uColor, uAccent, smoothstep(0.25, 0.85, ribbon) * 0.8);
    vec3 color = tint * (0.24 + diffuse * 0.63);
    color += uAccent * rim * (0.65 + uHigh * 0.7);
    color += vec3(1.0, 0.94, 1.0) * highlight * 0.85;
    color += tint * uBass * 0.16;
    float stripePosition = (vPosition.y + sin(vPosition.x * 2.5 + uTime * 0.3) * 0.12) * 30.0;
    float contour = 1.0 - smoothstep(0.04, 0.12, abs(sin(stripePosition)));
    color += mix(uColor, vec3(1.0), 0.45) * contour * uContours * (0.16 + rim * 0.32);
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function Visualizer({ analyser, settings, canvasRef }: {
  analyser: MutableRefObject<AnalyserNode | null>;
  settings: VisualSettings;
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
}) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(settings);
  const [error, setError] = useState(false);
  latest.current = settings;

  useEffect(() => {
    if (!host.current) return;
    const container = host.current;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    } catch {
      setError(true);
      return;
    }
    setError(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor("#0c0e15");
    container.appendChild(renderer.domElement);
    canvasRef.current = renderer.domElement;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    const root = new THREE.Group();
    const sculpture = new THREE.Group();
    scene.add(root);
    root.add(sculpture);
    const kind = settings.shape === "Orbit" ? 1 : settings.shape === "Crystal" ? 2 : 0;
    const uniforms = {
      uTime: { value: 0 }, uBass: { value: 0 }, uMid: { value: 0 }, uHigh: { value: 0 },
      uKind: { value: kind }, uColor: { value: new THREE.Color(latest.current.color) },
      uAccent: { value: new THREE.Color("#6df4df") }, uContours: { value: 1 },
    };
    const surface = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const mainGeometry = kind === 1
      ? new THREE.TorusKnotGeometry(0.88, 0.25, 220, 28, 2, 3)
      : kind === 2
        ? new THREE.OctahedronGeometry(0.96, 0)
        : new THREE.SphereGeometry(1.15, 96, 64);
    const main = new THREE.Mesh(mainGeometry, surface);
    sculpture.add(main);
    if (kind === 1) main.rotation.x = 0.35;
    if (kind === 2) main.scale.set(0.85, 1.45, 0.85);

    // A separate cage preserves actual wireframe detail without hiding the sculpture.
    const cageGeometry = kind === 1
      ? new THREE.TorusKnotGeometry(0.88, 0.253, 88, 8, 2, 3)
      : kind === 2 ? new THREE.OctahedronGeometry(0.968, 0) : new THREE.SphereGeometry(1.158, 36, 24);
    const cageMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: "uniform vec3 uColor; void main(){gl_FragColor=vec4(mix(uColor,vec3(1.0),0.4),0.16);}",
      uniforms, wireframe: true, transparent: true, depthWrite: false,
    });
    const cage = new THREE.Mesh(cageGeometry, cageMaterial);
    cage.rotation.copy(main.rotation);
    cage.scale.copy(main.scale);
    sculpture.add(cage);

    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: latest.current.color, transparent: true, opacity: 0.25,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const orbitGeometry = new THREE.TorusGeometry(1.65, 0.005, 5, 180);
    const halos: THREE.Mesh[] = [];
    for (let i = 0; i < 2; i++) {
      const ring = new THREE.Mesh(orbitGeometry, orbitMaterial);
      ring.rotation.set(1.1 + i * 0.7, i * 0.5, 0.3 + i * 0.8);
      root.add(ring);
      halos.push(ring);
    }

    const beadGeometry = new THREE.IcosahedronGeometry(0.05, 1);
    const beadMaterial = new THREE.MeshBasicMaterial({ color: "#d8c9ff" });
    const white = new THREE.Color("#ffffff");
    const beads = Array.from({ length: 9 }, () => {
      const bead = new THREE.Mesh(beadGeometry, beadMaterial);
      root.add(bead);
      return bead;
    });

    const shardGeometry = new THREE.OctahedronGeometry(0.23, 0);
    const shards: THREE.Mesh[] = [];
    if (kind === 2) {
      for (let i = 0; i < 8; i++) {
        const shard = new THREE.Mesh(shardGeometry, surface);
        shard.scale.set(0.7, 1.8 + (i % 3) * 0.25, 0.7);
        sculpture.add(shard);
        shards.push(shard);
      }
    }

    // Soft additive sprites are part of the WebGL canvas, so glow is exported too.
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 128;
    const glowContext = glowCanvas.getContext("2d")!;
    const gradient = glowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(255,255,255,0.5)");
    gradient.addColorStop(0.25, "rgba(255,255,255,0.22)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    glowContext.fillStyle = gradient;
    glowContext.fillRect(0, 0, 128, 128);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture, color: latest.current.color, opacity: 0.23,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMaterial);
    glow.position.z = -1.3;
    glow.scale.set(5.8, 5.8, 1);
    scene.add(glow);

    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(180 * 3);
    const particleRandom = (n: number) => {
      const value = Math.sin(n * 127.1 + 31.7) * 43758.5453;
      return value - Math.floor(value);
    };
    for (let i = 0; i < 180; i++) {
      const angle = particleRandom(i * 3) * Math.PI * 2;
      const radius = 2.0 + particleRandom(i * 3 + 1) * 4;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = Math.sin(angle) * radius;
      particlePositions[i * 3 + 2] = -1 - particleRandom(i * 3 + 2) * 4;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: "#b0a2da", size: 0.038, map: glowTexture, transparent: true,
      opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.position.z = camera.aspect < 1 ? 6.8 / camera.aspect : 6.8;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    let bins = new Uint8Array(512);
    let frame = 0, phase = 0, last = performance.now();
    let bass = 0, mid = 0, high = 0;
    let dragging = false, px = 0, py = 0;
    const down = (event: PointerEvent) => {
      dragging = true; px = event.clientX; py = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      root.rotation.y += (event.clientX - px) * 0.007;
      root.rotation.x += (event.clientY - py) * 0.007;
      px = event.clientX; py = event.clientY;
    };
    const up = () => { dragging = false; };
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerup", up);
    renderer.domElement.addEventListener("pointercancel", up);

    const band = (low: number, upper: number, node: AnalyserNode) => {
      const hzPerBin = node.context.sampleRate / node.fftSize;
      const start = Math.max(1, Math.floor(low / hzPerBin));
      const end = Math.min(bins.length, Math.max(start + 1, Math.ceil(upper / hzPerBin)));
      let sum = 0;
      for (let i = start; i < end; i++) sum += bins[i] / 255;
      return sum / Math.max(1, end - start);
    };
    const ease = (current: number, target: number, dt: number) =>
      THREE.MathUtils.lerp(current, target, 1 - Math.exp(-dt * (target > current ? 18 : 5)));

    const draw = (now: number) => {
      const state = latest.current;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      let targetBass = 0, targetMid = 0, targetHigh = 0;
      const node = analyser.current;
      if (node) {
        if (bins.length !== node.frequencyBinCount) bins = new Uint8Array(node.frequencyBinCount);
        node.getByteFrequencyData(bins);
        targetBass = Math.min(1.4, band(25, 180, node) * state.sensitivity);
        targetMid = Math.min(1.4, band(180, 2200, node) * state.sensitivity);
        targetHigh = Math.min(1.4, band(2200, 10000, node) * state.sensitivity * 1.5);
      }
      bass = ease(bass, targetBass, dt);
      mid = ease(mid, targetMid, dt);
      high = ease(high, targetHigh, dt);
      phase += dt * state.speed * (0.55 + mid * 0.45);
      uniforms.uTime.value = phase;
      uniforms.uBass.value = bass;
      uniforms.uMid.value = mid;
      uniforms.uHigh.value = high;
      uniforms.uColor.value.set(state.color);
      uniforms.uAccent.value.copy(uniforms.uColor.value).offsetHSL(0.21, -0.05, 0.06);
      uniforms.uContours.value = state.wireframe ? 1 : 0;
      cage.visible = state.wireframe;
      orbitMaterial.color.copy(uniforms.uColor.value);
      orbitMaterial.opacity = 0.16 + mid * 0.22;
      beadMaterial.color.copy(uniforms.uAccent.value).lerp(white, 0.3);
      glowMaterial.color.copy(uniforms.uColor.value);
      glowMaterial.opacity = 0.19 + bass * 0.12;
      glow.scale.setScalar(5.6 + bass * 0.4);

      sculpture.rotation.y = phase * 0.24;
      sculpture.rotation.z = Math.sin(phase * 0.4) * 0.16;
      sculpture.position.y = Math.sin(phase * 0.9) * 0.045;
      if (!dragging) root.rotation.y += dt * state.speed * 0.035;
      halos.forEach((ring, i) => {
        ring.rotation.z = phase * (i ? -0.15 : 0.1) + i * 0.8;
        ring.scale.setScalar(1 + bass * 0.035 + i * 0.075);
      });
      beads.forEach((bead, i) => {
        const angle = phase * (0.28 + (i % 3) * 0.09) + i * Math.PI * 2 / beads.length;
        const radius = 1.65 + (i % 2) * 0.14 + bass * 0.07;
        bead.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.48, Math.sin(angle + i) * 0.65);
        bead.scale.setScalar(0.55 + (i % 3) * 0.2 + high * 1.2);
      });
      shards.forEach((shard, i) => {
        const angle = i * Math.PI * 2 / shards.length;
        const radius = 1.2 + bass * 0.3;
        shard.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(angle * 2 + phase) * 0.25);
        shard.rotation.set(phase * 0.3 + i, angle, angle - Math.PI / 2);
      });
      particles.visible = state.particles;
      particles.rotation.z = phase * 0.022;
      particleMaterial.size = 0.035 + high * 0.025;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerup", up);
      renderer.domElement.removeEventListener("pointercancel", up);
      [mainGeometry, cageGeometry, orbitGeometry, beadGeometry, shardGeometry, particleGeometry].forEach(geometry => geometry.dispose());
      [surface, cageMaterial, orbitMaterial, beadMaterial, glowMaterial, particleMaterial].forEach(material => material.dispose());
      glowTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      canvasRef.current = null;
    };
  }, [settings.shape, analyser, canvasRef]);

  return <div className="visual-canvas" ref={host}>{error && <div className="webgl-error">3D rendering needs WebGL. Enable hardware acceleration and reload.</div>}</div>;
}
