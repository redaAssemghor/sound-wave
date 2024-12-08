import React, { useRef, ChangeEvent, useState } from "react";
import Checkbox from "./ui/CheckBox";

interface FileUploadProps {
  onFileChange: (file: File) => void;
  handelShape: (shape: string) => void;
  setWireframe: (wireframe: boolean) => void;
  audioUrl: string | undefined;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  handelShape,
  setWireframe,
  audioUrl,
  audioRef,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickedShape, setPickedShape] = useState("");
  const [pickedFile, setPickedFile] = useState<File | null>(null);

  const handleWireframe = (event: ChangeEvent<HTMLInputElement>) => {
    setWireframe(event.target.checked);
    console.log(event.target.checked);
  };

  const handelShapePicker = (event: ChangeEvent<HTMLSelectElement>) => {
    const shape = event.target.value;
    setPickedShape(shape);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPickedFile(file);
    }
  };

  const handelSubmit = () => {
    if (pickedShape && pickedFile) {
      handelShape(pickedShape);
      onFileChange(pickedFile);
    } else {
      alert("Please pick a shape and upload an MP3 file.");
    }
  };

  return (
    <div className="min-w-[400px] h-full p-8">
      <h1 className="font-bold text-3xl">
        Upload an MP3 file and Pick a shape to start the animation.
      </h1>
      <div className="flex flex-col gap-8 my-10">
        <select
          onChange={handelShapePicker}
          className="select select-secondary w-full max-w-xs"
        >
          <option disabled selected>
            Pick a shape ?
          </option>
          <option value="sphere">Sphere</option>
          <option value="torus">Torus</option>
          <option value="cone">Cone</option>
        </select>
        <input
          type="file"
          className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        <Checkbox handleWireframe={handleWireframe} />

        <audio
          className="w-full h-12 bg-transparent shadow-inner"
          src={audioUrl}
          controls
          ref={audioRef}
        />
      </div>
      <button
        className="btn btn-outline btn-secondary mt-auto"
        onClick={handelSubmit}
      >
        Start Animation
      </button>
    </div>
  );
};

export default FileUpload;
