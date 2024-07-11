import { useEffect, useRef } from "react";

interface ReactiveSoundWaveProps {
  audioFile: File;
}

const ReactiveSoundWave: React.FC<ReactiveSoundWaveProps> = ({ audioFile }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (audioFile) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const canvasContext = canvas.getContext("2d");

      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        source.connect(analyser);
        analyser.connect(audioContext.destination);
        source.start();

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          requestAnimationFrame(draw);

          analyser.getByteTimeDomainData(dataArray);

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
        };

        draw();
      };

      reader.readAsArrayBuffer(audioFile);

      return () => {
        audioContext.close();
      };
    }
  }, [audioFile]);

  return <canvas ref={canvasRef} width={800} height={300}></canvas>;
};

export default ReactiveSoundWave;
