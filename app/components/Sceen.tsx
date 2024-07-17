import React, { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import SoundWaveBall from "./SoundWaveBall";
import { Ground } from "./Ground";

interface SceenProps {
  domAudioFile: File;
}

const Sceen: React.FC<SceenProps> = ({ domAudioFile }) => {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [source, setSource] = useState<AudioBufferSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (domAudioFile) {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext();
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;

      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target?.result) {
          const audioBuffer = event.target.result as ArrayBuffer;
          audioCtx.decodeAudioData(audioBuffer, (buffer) => {
            setAudioContext(audioCtx);
            setAnalyser(analyserNode);

            if (audioRef.current) {
              const audioElement = audioRef.current;
              audioElement.src = URL.createObjectURL(domAudioFile);

              audioElement.onplay = () => {
                const newSource = audioCtx.createBufferSource();
                newSource.buffer = buffer;
                newSource.connect(analyserNode);
                analyserNode.connect(audioCtx.destination);

                const track = audioCtx.createMediaElementSource(audioElement);
                track.connect(analyserNode);
                analyserNode.connect(audioCtx.destination);

                newSource.start(0, audioElement.currentTime);
                setSource(newSource);
              };

              audioElement.onpause = () => {
                if (source) {
                  source.stop();
                }
              };
            }
          });
        }
      };
      fileReader.readAsArrayBuffer(domAudioFile);

      setAudioUrl(URL.createObjectURL(domAudioFile));
    }
  }, [domAudioFile]);

  return (
    <div className="h-full">
      {audioUrl && (
        <audio id="audio_tag" src={audioUrl} controls ref={audioRef} />
      )}
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
    </div>
  );
};

export default Sceen;
