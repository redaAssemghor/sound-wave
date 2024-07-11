import React, { useEffect, useRef, useState } from "react";

interface ReactiveSoundWaveProps {
  audioFile: File;
}

const ReactiveSoundWave: React.FC<ReactiveSoundWaveProps> = ({ audioFile }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioFile) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const canvasContext = canvas.getContext("2d");

      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 2048;

        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContext.destination);
        sourceRef.current = source;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          requestAnimationFrame(draw);

          if (analyserRef.current) {
            analyserRef.current.getByteTimeDomainData(dataArray);
            if (canvasContext) {
              canvasContext.clearRect(0, 0, canvas.width, canvas.height);
              canvasContext.beginPath();

              const sliceWidth = (canvas.width * 1.0) / bufferLength;
              let x = 0;

              for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * canvas.height) / 2;

                if (i === 0) {
                  canvasContext.moveTo(x, y);
                } else {
                  canvasContext.lineTo(x, y);
                }

                x += sliceWidth;
              }

              canvasContext.lineTo(canvas.width, canvas.height / 2);
              canvasContext.strokeStyle = "rgba(0,0,0,0.5)";
              canvasContext.lineWidth = 2;
              canvasContext.stroke();
            }
          }
        };

        draw();
      };

      reader.readAsArrayBuffer(audioFile);

      return () => {
        audioContext.close();
      };
    }
  }, [audioFile]);

  const handlePlayPause = () => {
    if (audioContextRef.current && sourceRef.current && analyserRef.current) {
      if (isPlaying) {
        audioContextRef.current.suspend();
      } else {
        if (audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume();
        } else {
          sourceRef.current.start();
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        className="border border-gray-300 my-4"
      ></canvas>
      <button
        onClick={handlePlayPause}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
    </div>
  );
};

export default ReactiveSoundWave;
