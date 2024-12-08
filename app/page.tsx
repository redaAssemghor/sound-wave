"use client";
import React, { useRef, useState } from "react";
import FileUpload from "./components/FileUpload";
import dynamic from "next/dynamic";
import Loading from "./components/Loading";

const DynamicSceen = dynamic(() => import("./components/Sceen"), {
  ssr: false,
  loading: () => <Loading />,
});

const Home: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [shape, setShape] = useState("");
  const [wireframe, setWireframe] = useState(false);

  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleShapeChange = (shape: string) => {
    setShape(shape);
  };

  const handleFileChange = (file: File) => {
    setAudioFile(file);
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col md:flex-row">
      <FileUpload
        setWireframe={setWireframe}
        onFileChange={handleFileChange}
        handelShape={handleShapeChange}
        audioRef={audioRef}
        audioUrl={audioUrl}
      />
      <div className="w-full bg-gray-800">
        {audioFile && (
          <DynamicSceen
            wireframe={wireframe}
            domAudioFile={audioFile}
            shape={shape}
            setAudioUrl={setAudioUrl}
            audioRef={audioRef}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
