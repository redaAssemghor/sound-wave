import React, { useRef } from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import { fragmentShader, vertexShader } from "./shader";

// Create the shader material
const WaveShaderMaterial = shaderMaterial(
  {
    u_time: 0,
    u_frequency: 0,
    u_red: 238 / 255,
    u_green: 130 / 255,
    u_blue: 238 / 255,
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

const TorusShape: React.FC<{ analyser: AnalyserNode | null }> = ({
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

        // Dynamic color change based on frequency
        material.uniforms.u_red.value = avgFrequency / 256;
        // material.uniforms.u_green.value = (256 - avgFrequency) / 256;
        material.uniforms.u_blue.value =
          0.5 + 0.5 * Math.sin(clock.getElapsedTime());
      }

      // Scale the mesh based on the average frequency
      const scale = 1 + avgFrequency / 256;
      meshRef.current.scale.set(scale, scale, scale);

      // Rotate the torus more dynamically
      meshRef.current.rotation.x += 0.0005;
      meshRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 1.4, 0]}>
      <coneGeometry args={[1, 0.4, 18, 100]} />
      <waveShaderMaterial wireframe />
    </mesh>
  );
};

export default TorusShape;
