import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ReactiveSoundWaveProps {
  audioFile: File;
}

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
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={"orange"} />
    </mesh>
  );
};

const ReactiveSoundWave: React.FC<ReactiveSoundWaveProps> = ({ audioFile }) => {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (audioFile) {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;

      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target?.result) {
          audioContext.decodeAudioData(
            event.target.result as ArrayBuffer,
            (buffer) => {
              const source = audioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(analyserNode);
              analyserNode.connect(audioContext.destination);
              source.start(0);
            }
          );
        }
      };
      fileReader.readAsArrayBuffer(audioFile);

      setAnalyser(analyserNode);
    }
  }, [audioFile]);

  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <SoundWaveMesh analyser={analyser} />
    </Canvas>
  );
};

export default ReactiveSoundWave;
