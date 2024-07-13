import React, { useRef, useEffect } from "react";
import { useFrame, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import vertexShader from "./vertexShader.glsl";
import fragmentShader from "./fragmentShader.glsl";

// Create the custom shader material
const DistortMaterial = shaderMaterial(
  {
    u_time: 0,
    u_frequency: 0,
  },
  vertexShader,
  fragmentShader
);

extend({ DistortMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      distortMaterial: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { attach?: string; uniforms?: any };
    }
  }
}

const SoundWaveMesh: React.FC<{ analyser: AnalyserNode | null }> = ({
  analyser,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (analyser && meshRef.current) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const avgFrequency = dataArray.reduce((a, b) => a + b) / dataArray.length;

      // Update time and frequency uniforms
      const material = meshRef.current.material as any;
      if (material.uniforms) {
        material.uniforms.u_time.value = clock.getElapsedTime();
        material.uniforms.u_frequency.value = avgFrequency / 256;
      }

      // Rotate the sphere slowly
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[4, 30]} />
      <distortMaterial attach="material" />
    </mesh>
  );
};

export default SoundWaveMesh;
