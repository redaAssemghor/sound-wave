import React, { useRef } from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";

// Create the shader material
const WaveShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uFrequency: 0,
    uColor: new THREE.Color(0.0, 0.0, 0.0),
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
        material.uniforms.uTime.value = clock.getElapsedTime();
        material.uniforms.uFrequency.value = avgFrequency / 64;
      }

      // Rotate the sphere more slowly
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[4, 30]} />
      <waveShaderMaterial uColor={new THREE.Color("hotpink")} />
    </mesh>
  );
};

export default SoundWaveMesh;
