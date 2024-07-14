"use client";
import { useState } from "react";
import FileUpload from "./components/FileUpload";
import ReactiveSoundWave from "./components/ReactiveSoundWave";

const Home: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleFileChange = (file: File) => {
    setAudioFile(file);
  };

  return (
    <div className="h-screen ">
      <FileUpload onFileChange={handleFileChange} />
      {audioFile && <></>}
      <ReactiveSoundWave audioFile={audioFile} />
    </div>
  );
};

export default Home;
