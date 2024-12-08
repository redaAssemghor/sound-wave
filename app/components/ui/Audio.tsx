import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Input = ({ audioUrl, audioRef }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Helper function to format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      // Update duration once metadata is loaded
      const handleLoadedMetadata = () => {
        setDuration(audioElement.duration);
      };

      // Update current time as the audio plays
      const handleTimeUpdate = () => {
        setCurrentTime(audioElement.currentTime);
      };

      // Attach event listeners
      audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioElement.addEventListener("timeupdate", handleTimeUpdate);

      // Cleanup event listeners
      return () => {
        audioElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [audioRef]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  return (
    <StyledWrapper>
      <div className="audio green-audio-player">
        <div className="play-pause-btn" onClick={handlePlayPause}>
          <svg
            viewBox="0 0 18 24"
            height={24}
            width={18}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              id="playPause"
              className="play-pause-icon"
              d="M18 12L0 24V0"
              fillRule="evenodd"
              fill="#566574"
            />
          </svg>
        </div>
        <div className="controls">
          <span className="current-time">{formatTime(currentTime)}</span>
          <div data-direction="horizontal" className="slider">
            <div className="progress">
              <div data-method="rewind" id="progress-pin" className="pin" />
            </div>
          </div>
          <span className="total-time">{formatTime(duration)}</span>
        </div>
        {/* <div className="volume">
          <div className="volume-btn">
            <svg
              viewBox="0 0 24 24"
              height={24}
              width={24}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                id="speaker"
                d="M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z"
                fillRule="evenodd"
                fill="#566574"
              />
            </svg>
          </div>
          <div className="volume-controls hidden">
            <div data-direction="vertical" className="slider">
              <div className="progress">
                <div
                  data-method="changeVolume"
                  id="volume-pin"
                  className="pin"
                />
              </div>
            </div>
          </div>
        </div> */}
        <div className="volume">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
        <audio src={audioUrl} ref={audioRef} />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .audio.green-audio-player {
    width: 400px;
    min-width: 300px;
    height: 56px;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.07);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 24px;
    padding-right: 24px;
    border-radius: 4px;
    user-select: none;
    -webkit-user-select: none;
    background-color: #fff;
  }

  .audio.green-audio-player .play-pause-btn {
    cursor: pointer;
  }

  .audio.green-audio-player .slider {
    flex-grow: 1;
    background-color: #d8d8d8;
    cursor: pointer;
    position: relative;
  }

  .audio.green-audio-player .slider .progress {
    background-color: #44bfa3;
    border-radius: inherit;
    position: absolute;
    pointer-events: none;
  }

  .audio.green-audio-player .slider .progress .pin {
    height: 16px;
    width: 16px;
    border-radius: 8px;
    background-color: #44bfa3;
    position: absolute;
    pointer-events: all;
    box-shadow: 0px 1px 1px 0px rgba(0, 0, 0, 0.32);
  }

  .audio.green-audio-player .controls {
    font-family: "Roboto", sans-serif;
    font-size: 16px;
    line-height: 18px;
    color: #55606e;
    display: flex;
    flex-grow: 1;
    justify-content: space-between;
    align-items: center;
    margin-left: 24px;
    margin-right: 24px;
  }

  .audio.green-audio-player .controls .slider {
    margin-left: 16px;
    margin-right: 16px;
    border-radius: 2px;
    height: 4px;
  }

  .audio.green-audio-player .controls .slider .progress {
    width: 0;
    height: 100%;
  }

  .audio.green-audio-player .controls .slider .pin {
    right: -8px;
    top: -6px;
  }

  .audio.green-audio-player .controls span {
    cursor: default;
  }

  .audio.green-audio-player .volume {
    position: relative;
  }

  .audio.green-audio-player .volume .volume-btn {
    cursor: pointer;
  }

  .audio.green-audio-player .volume .volume-btn .open path {
    fill: #44bfa3;
  }

  .audio.green-audio-player .volume .volume-controls {
    width: 30px;
    height: 135px;
    background-color: rgba(0, 0, 0, 0.62);
    border-radius: 7px;
    position: absolute;
    left: -3px;
    bottom: 52px;
    flex-direction: column;
    align-items: center;
    display: flex;
  }

  .audio.green-audio-player .volume .volume-controls.hidden {
    display: none;
  }

  .audio.green-audio-player .volume .volume-controls .slider {
    margin-top: 12px;
    margin-bottom: 12px;
    width: 6px;
    border-radius: 3px;
  }

  .audio.green-audio-player .volume .volume-controls .slider .progress {
    bottom: 0;
    height: 100%;
    width: 6px;
  }

  .audio.green-audio-player .volume .volume-controls .slider .progress .pin {
    left: -5px;
    top: -8px;
  }
`;

export default Input;
