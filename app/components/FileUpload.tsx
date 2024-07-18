import React, { useRef, ChangeEvent, useState } from "react";

interface FileUploadProps {
  onFileChange: (file: File) => void;
  handelShape: (shape: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  handelShape,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickedShape, setPickedShape] = useState("");
  const [pickedFile, setPickedFile] = useState<File | null>(null);

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
    <div className="max-w-[350px] p-4">
      <h1 className="font-bold text-xl">
        Upload an MP3 file and Pick a shape to start the animation.
      </h1>
      <div className="flex flex-col gap-4 my-10">
        <select
          onChange={handelShapePicker}
          className="select select-secondary w-full max-w-xs"
        >
          <option disabled selected>
            Pick a shape ?
          </option>
          <option value="sphere">Sphere</option>
          <option value="torus">Torus</option>
        </select>
        <input
          type="file"
          className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
      <button className="btn btn-outline btn-secondary" onClick={handelSubmit}>
        Start Animation
      </button>
    </div>
  );
};

export default FileUpload;
