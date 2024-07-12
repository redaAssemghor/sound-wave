import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SoundWaveMesh: React.FC<{ analyser: AnalyserNode | null }> = ({
  analyser,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (analyser && meshRef.current) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      const scale = 1 + dataArray[0] / 128;
      meshRef.current.scale.set(scale, scale, scale);

      // Rotate the sphere
      meshRef.current.rotation.x += 0.0003;
      meshRef.current.rotation.y += 0.0003;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={"blue"} wireframe />
    </mesh>
  );
};

export default SoundWaveMesh;
