import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import SoundWaveBall from "./SoundWaveBall";
import { Ground } from "./Ground";

interface SceenProps {
  audioFile: File;
}

const Sceen: React.FC<SceenProps> = ({ audioFile }) => {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioFile) {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;

      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target?.result) {
          const audioBuffer = event.target.result as ArrayBuffer;
          audioContext.decodeAudioData(audioBuffer, (buffer) => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(analyserNode);
            analyserNode.connect(audioContext.destination);
            source.start(0);

            if (audioRef.current) {
              const audioElement = audioRef.current;
              audioElement.src = URL.createObjectURL(audioFile);
              audioElement.onplay = () => {
                const track =
                  audioContext.createMediaElementSource(audioElement);
                track.connect(analyserNode);
                analyserNode.connect(audioContext.destination);
              };
            }
          });
        }
      };
      fileReader.readAsArrayBuffer(audioFile);

      setAnalyser(analyserNode);
      setAudioUrl(URL.createObjectURL(audioFile));
    }
  }, [audioFile]);

  return (
    <Canvas>
      <PerspectiveCamera makeDefault fov={50} position={[3, 2, 5]} />
      <color args={[0, 0, 0]} attach="background" />
      <spotLight
        color={[1, 0.25, 0.7]}
        intensity={1.5}
        angle={0.6}
        penumbra={0.5}
        position={[5, 5, 0]}
        castShadow
        shadow-bias={-0.0001}
      />
      <spotLight
        color={[0.14, 0.5, 1]}
        intensity={2}
        angle={0.6}
        penumbra={0.5}
        position={[-5, 5, 0]}
        castShadow
        shadow-bias={-0.0001}
      />

      <OrbitControls target={[0, 0.35, 0]} maxPolarAngle={1.45} />
      <SoundWaveBall analyser={analyser} />
      <Ground />
    </Canvas>
  );
};

export default Sceen;
