import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SoundWaveBall from "./SoundWaveBall";

interface ReactiveSoundWaveProps {
  audioFile: File;
}

const ReactiveSoundWave: React.FC<ReactiveSoundWaveProps> = ({ audioFile }) => {
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
    <div className="h-full">
      {audioUrl && <audio controls src={audioUrl} ref={audioRef} />}
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <SoundWaveBall analyser={analyser} />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default ReactiveSoundWave;
