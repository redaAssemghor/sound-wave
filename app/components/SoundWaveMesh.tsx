import React, { useRef } from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";

// Create the shader material
const WaveShaderMaterial = shaderMaterial(
  {
    u_time: 0,
    u_frequency: 0,
    u_red: 1.0,
    u_green: 1.0,
    u_blue: 1.0,
  },
  vertexShader,
  fragmentShader
);

declare global {
  namespace JSX {
    interface IntrinsicElements {
      waveShaderMaterial: any;
    }
  }
}

extend({ WaveShaderMaterial });

const SoundWaveMesh: React.FC<{ analyser: AnalyserNode | null }> = ({
  analyser,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (analyser && meshRef.current) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      const avgFrequency =
        dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      // Cast the material to the correct type
      const material = meshRef.current.material as any;
      if (material.uniforms) {
        material.uniforms.u_time.value = clock.getElapsedTime();
        material.uniforms.u_frequency.value = avgFrequency;
      }

      // Rotate the sphere more dynamically
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[4, 30]} />
      <waveShaderMaterial wireframe />
    </mesh>
  );
};

export default SoundWaveMesh;
