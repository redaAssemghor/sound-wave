import React, { useState, useRef, useEffect } from "react";
import {
  FaDownload,
  FaArrowLeft,
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaFastForward,
  FaFastBackward,
} from "react-icons/fa";
import Image from "next/image";

interface CustomAudioPlayerProps {
  audioUrl: string;
  onBack: () => void;
  onDownload: () => void;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({
  audioUrl,
  onBack,
  onDownload,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateProgress = () => {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(formatTime(audio.currentTime));
        setDuration(formatTime(audio.duration));
      };
      audio.addEventListener("timeupdate", updateProgress);
      return () => {
        audio.removeEventListener("timeupdate", updateProgress);
      };
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changePlaybackRate = (rate: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const skipTime = (amount: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(
        audio.duration,
        Math.max(0, audio.currentTime + amount)
      );
    }
  };

  return (
    <div className=" bg-white ">
      <div className="lg:w-2/5 p-8 flex flex-col justify-between">
        <audio
          className="w-full h-12 bg-gray-900 rounded-lg shadow-inner outline-none focus:ring-2 focus:ring-purple-600"
          src={audioUrl}
          controls
          ref={audioRef}
        />
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
