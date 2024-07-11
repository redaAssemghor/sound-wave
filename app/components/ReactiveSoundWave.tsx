import { useEffect, useRef } from "react";

interface ReactiveSoundWaveProps {
  audioFile: File;
}

const ReactiveSoundWave: React.FC<ReactiveSoundWaveProps> = ({ audioFile }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const audioCtx = new AudioContext();
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext("2d");

    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(audioFile);
    fileReader.onloadend = () => {
      audioCtx.decodeAudioData(fileReader.result as ArrayBuffer, (buffer) => {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;

        const analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        source.start();

        const draw = () => {
          if (!canvas || !canvasCtx) return;
          requestAnimationFrame(draw);

          analyser.getByteTimeDomainData(dataArray);

          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

          canvasCtx.beginPath();
          const sliceWidth = (canvas.width * 1.0) / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;

            if (i === 0) {
              canvasCtx.moveTo(x, y);
            } else {
              canvasCtx.lineTo(x, y);
            }

            x += sliceWidth;
          }

          canvasCtx.lineTo(canvas.width, canvas.height / 2);
          canvasCtx.stroke();
        };

        draw();
      });
    };

    return () => {
      audioCtx.close();
    };
  }, [audioFile]);

  return (
    <canvas
      ref={canvasRef}
      width="600"
      height="200"
      className="border border-gray-300"
    ></canvas>
  );
};

export default ReactiveSoundWave;
