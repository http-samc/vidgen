import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  Video as RemotionVideo,
} from "remotion";
import { getAudioData } from "@remotion/media-utils";

interface AudioPath {
  path: string;
  speaker: string;
}

interface CharacterAssetLookup {
  [key: string]: string;
}

export interface VideoProps {
  audioPaths: AudioPath[];
  delay: number;
  assetLookup: CharacterAssetLookup;
  transcript?: {
    words: Array<{
      text: string;
      start: number;
      end: number;
    }>;
  };
}

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: "10px 20px",
        borderRadius: "5px",
        maxWidth: "80%",
        textAlign: "center",
      }}
    >
      <span
        style={{
          color: "white",
          fontSize: "2em",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        {text}
      </span>
    </div>
  );
};

const CharacterImage: React.FC<{ src: string }> = ({ src }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "25%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "200px",
        height: "200px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src={src}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
        alt="Character"
      />
    </div>
  );
};

export const Video: React.FC<VideoProps> = ({
  audioPaths,
  delay,
  assetLookup,
  transcript,
}) => {
  const [startTimes, setStartTimes] = useState<number[]>([]);

  useEffect(() => {
    const calculateStartTimes = async () => {
      const durations = await Promise.all(
        audioPaths.map((audio) => getAudioData(staticFile(audio.path)))
      );

      const times = durations.reduce<number[]>((acc, duration, index) => {
        const previousStart = acc[index - 1] ?? 0;
        const previousDuration = durations[index - 1]?.durationInSeconds ?? 0;
        return [...acc, previousStart + previousDuration + delay];
      }, []);

      setStartTimes(times);
    };

    calculateStartTimes();
  }, [audioPaths, delay]);

  // Calculate total duration for the background video
  const lastStartTime = startTimes[startTimes.length - 1];
  const totalDuration =
    startTimes.length > 0 && lastStartTime !== undefined
      ? lastStartTime + (audioPaths.length > 0 ? 30 * 5 : 0) // Add 5 seconds buffer
      : 0;

  const startFrom = 30 * 30; // 30 seconds in frames
  const endAt = startFrom + totalDuration * 30; // Convert totalDuration to frames and add to startFrom

  return (
    <AbsoluteFill>
      {/* Background Video */}
      <RemotionVideo
        src={staticFile("gameplay.mp4")}
        startFrom={startFrom}
        endAt={endAt}
        muted={true}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Audio and Character Sequences */}
      {audioPaths.map((audio, index) => {
        const characterAsset = assetLookup[audio.speaker];
        return (
          <Sequence
            key={audio.path}
            from={Math.floor((startTimes[index] ?? 0) * 30)} // Convert to frames (30fps)
          >
            <Audio src={staticFile(audio.path)} />
            {characterAsset && (
              <CharacterImage src={staticFile(characterAsset)} />
            )}
          </Sequence>
        );
      })}

      {/* Subtitles */}
      {transcript?.words.map((word, index) => {
        const startFrame = Math.floor(word.start * 30); // Convert to frames (30fps)
        const endFrame = Math.floor(word.end * 30);
        const currentFrame = Math.floor(startFrame - 6); // Show 0.2 seconds before (6 frames at 30fps)
        const duration = endFrame - startFrame + 12; // Show 0.2 seconds after (6 frames at 30fps)

        return (
          <Sequence key={index} from={currentFrame} durationInFrames={duration}>
            <Subtitle text={word.text} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
