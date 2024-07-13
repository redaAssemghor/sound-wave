import * as THREE from "three";
import React, { useRef } from "react";
import { extend, useFrame, useLoader } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import vertexShader from "./shaders/vertexShader.glsl";
import fragmentShader from "./shaders/fragmentShader.glsl";

// Create the shader material
const WaveShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0.0, 0.0, 0.0),
    uTexture: new THREE.Texture(),
  },
  vertexShader,
  fragmentShader
);

extend({ WaveShaderMaterial });

// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       waveShaderMaterial: any;
//     }
//   }
// }

const WaveMesh = () => {
  const ref = useRef<any>();
  useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));

  const image = useLoader(THREE.TextureLoader, [
    "https://images.unsplash.com/photo-1604011092346-0b4346ed714e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1534&q=80",
  ])[0];

  return (
    <mesh>
      <boxGeometry args={[5, 7, 5, 5]} />
      <waveShaderMaterial uColor={"hotpink"} ref={ref} uTexture={image} />
    </mesh>
  );
};

export default WaveMesh;
