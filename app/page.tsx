"use client";
import { useRef, useState } from "react";
import FileUpload from "./components/FileUpload";
import dynamic from "next/dynamic";

const DynamicSceen = dynamic(() => import("./components/Sceen"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const Home: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileChange = (file: File) => {
    setAudioFile(file);
  };

  return (
    <div className="h-screen">
      <FileUpload onFileChange={handleFileChange} />

      <DynamicSceen domAudioFile={audioFile} />
    </div>
  );
};

export default Home;
