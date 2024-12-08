import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import BallShape from "./BallShape";
import { Ground } from "./Ground";
import TorusShape from "./TorusShape";
import { useControls } from "leva";
import ConeShape from "./ConeShape";
import Input from "./ui/Audio";

interface SceenProps {
  domAudioFile: File;
  shape: string;
  wireframe: boolean;
  setAudioUrl: (url: string) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const Sceen: React.FC<SceenProps> = ({
  domAudioFile,
  shape,
  wireframe,
  setAudioUrl,
  audioRef,
}) => {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [source, setSource] = useState<AudioBufferSourceNode | null>(null);

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
                const track = audioCtx.createMediaElementSource(audioElement);
                track.connect(analyserNode);
                analyserNode.connect(audioCtx.destination);
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
    <div className="h-full w-full">
      {/* <div className="h-20 p-4  rounded-lg">
        {audioUrl && (
          <audio
            className="w-full h-12 bg-transparent shadow-inner"
            src={audioUrl}
            controls
            ref={audioRef}
          />
          // <Input audioRef={audioRef} audioUrl={audioUrl} />
        )}
      </div> */}
      <Canvas>
        <PerspectiveCamera makeDefault fov={50} position={[3, 2, 5]} />
        <color args={[0, 0, 0]} attach="background" />
        <spotLight
          color={[1, 0.25, 0.7]}
          intensity={1}
          angle={0.6}
          penumbra={0.5}
          position={[5, 5, 0]}
          castShadow
          shadow-bias={-0.0001}
        />
        <spotLight
          color={[0.14, 0.5, 1]}
          intensity={1}
          angle={0.6}
          penumbra={0.5}
          position={[-5, 5, 0]}
          castShadow
          shadow-bias={-0.0001}
        />

        <OrbitControls
          target={[0, 0.35, 0]}
          maxPolarAngle={1.45}
          maxDistance={10}
          minDistance={5}
        />
        {shape === "sphere" && (
          <BallShape wireframe={wireframe} analyser={analyser} />
        )}
        {shape === "torus" && (
          <TorusShape wireframe={wireframe} analyser={analyser} />
        )}
        {shape === "cone" && (
          <ConeShape wireframe={wireframe} analyser={analyser} />
        )}
        <Ground />
      </Canvas>
    </div>
  );
};

export default Sceen;
