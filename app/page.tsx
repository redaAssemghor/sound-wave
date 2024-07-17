"use client";
import React, { useState } from "react";
import FileUpload from "./components/FileUpload";
import dynamic from "next/dynamic";

const DynamicSceen = dynamic(() => import("./components/Sceen"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

const Home: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [shape, setShape] = useState("");

  const handleShapeChange = (shape: string) => {
    setShape(shape);
  };

  const handleFileChange = (file: File) => {
    setAudioFile(file);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <FileUpload
        onFileChange={handleFileChange}
        handelShape={handleShapeChange}
      />
      {/* <DynamicSceen domAudioFile={audioFile} shape={shape} /> */}
      {audioFile && <DynamicSceen domAudioFile={audioFile} shape={shape} />}
    </div>
  );
};

export default Home;
