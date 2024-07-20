"use client";
import React, { useState } from "react";
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
      <div className="lg:min-w-[1200px] bg-gray-800">
        {audioFile && <DynamicSceen domAudioFile={audioFile} shape={shape} />}
      </div>
    </div>
  );
};

export default Home;
