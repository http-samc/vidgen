/* eslint-disable @typescript-eslint/no-non-null-assertion */

import React, { useEffect, useState } from "react";
import { getAudioData } from "@remotion/media-utils";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo as RemotionVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";

interface AudioPath {
  path: string;
  speaker: string;
}

type CharacterAssetLookup = Record<
  string,
  {
    path: string;
    width: number;
    position: "left" | "right";
    voice: string;
  }
>;

export interface VideoProps {
  audioPaths: AudioPath[];
  delay: number;
  assetLookup: CharacterAssetLookup;
  devMode?: boolean;
  backgroundBlurPx?: number;
  backgroundVideo: string;
  transcript?: {
    words: {
      text: string;
      start: number;
      end: number;
    }[];
  };
}

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const opacity = spring({
    frame,
    fps: 30,
    from: 0,
    to: 1,
    durationInFrames: 15,
    config: {
      damping: 12,
      mass: 0.5,
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "33%", // Position 1/3 from the top
        left: "50%",
        transform: `translateX(-50%) translateY(${spring({
          frame,
          fps: 30,
          from: 10,
          to: 0,
          durationInFrames: 15,
          config: {
            damping: 12,
            mass: 0.5,
          },
        })}px)`,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: "15px 30px",
        borderRadius: "8px",
        maxWidth: "80%",
        textAlign: "center",
        opacity,
      }}
    >
      <span
        style={{
          color: "#FFD700", // Yellow color
          fontSize: "4em", // Bigger text
          fontWeight: "bold",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
          letterSpacing: "0.5px",
          fontFamily: "fantasy",
        }}
      >
        {text}
      </span>
    </div>
  );
};

const CharacterImage: React.FC<CharacterAssetLookup[string]> = ({
  path,
  width,
  position,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "25%",
        left: 0,
        right: 0,
        padding: "0 50px",
        display: "flex",
        justifyContent: position === "left" ? "flex-start" : "flex-end",
        alignItems: "center",
      }}
    >
      <Img
        src={path}
        style={{
          width: width,
          height: "auto",
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
  backgroundBlurPx = 0,
  backgroundVideo,
}) => {
  const [startTimes, setStartTimes] = useState<number[]>([]);
  const [durations, setDurations] = useState<number[]>([]);

  useEffect(() => {
    console.log(
      "=== Video component useEffect triggered with",
      audioPaths.length,
      "audio paths",
    );
    console.log("=== Audio paths:", audioPaths);

    const calculateStartTimes = async () => {
      try {
        console.log("=== Starting calculateStartTimes in Video component");
        const audioData = await Promise.all(
          audioPaths.map(async (audio, index) => {
            console.log(
              `=== Video: Processing audio ${index + 1}/${audioPaths.length}:`,
              audio.path,
            );
            try {
              const data = await getAudioData(staticFile(audio.path));
              console.log(
                `=== Video: Successfully got audio data for ${audio.path}: duration=${data.durationInSeconds}s`,
              );
              return data;
            } catch (error) {
              console.error(
                `=== Video: Failed to get audio data for ${audio.path}:`,
                error,
              );
              console.log(
                `=== Video: Using fallback duration for ${audio.path}`,
              );
              // Return a mock audio data object if getAudioData fails
              return {
                durationInSeconds: 5, // Default 5 seconds
                sampleRate: 44100,
                numberOfChannels: 2,
              };
            }
          }),
        );

        console.log(
          "=== Video: All audio data collected:",
          audioData.map((d) => ({ duration: d.durationInSeconds })),
        );

        const times = audioData.reduce<number[]>((acc, _, index) => {
          const previousStart = acc[index - 1] ?? 0;
          const previousDuration = audioData[index - 1]?.durationInSeconds ?? 0;
          return [...acc, previousStart + previousDuration + delay];
        }, []);

        console.log("=== Video: Calculated start times:", times);
        const durations = audioData.map((data) => data.durationInSeconds);
        console.log("=== Video: Calculated durations:", durations);

        setStartTimes(times);
        setDurations(durations);
        console.log("=== Video: State updated successfully");
      } catch (error) {
        console.error("=== Video: Error in calculateStartTimes:", error);
        // Set default values if everything fails
        const defaultDurations = audioPaths.map(() => 5); // 5 seconds each
        const defaultTimes = defaultDurations.reduce<number[]>(
          (acc, _, index) => {
            const previousStart = acc[index - 1] ?? 0;
            const previousDuration = defaultDurations[index - 1] ?? 0;
            return [...acc, previousStart + previousDuration + delay];
          },
          [],
        );

        console.log("=== Video: Using fallback times:", defaultTimes);
        console.log("=== Video: Using fallback durations:", defaultDurations);

        setStartTimes(defaultTimes);
        setDurations(defaultDurations);
      }
    };

    void calculateStartTimes();
  }, [audioPaths, delay]);

  // Calculate total duration for the background video
  const lastStartTime = startTimes[startTimes.length - 1]!;
  const totalDuration =
    startTimes.length > 0
      ? lastStartTime + (audioPaths.length > 0 ? 5 : 0) // Add 2 second buffer
      : 0;

  const startFrom = 30 * 30; // 30 seconds in frames
  const endAt = startFrom + (totalDuration + 5) * 30; // Add 2 second buffer

  return (
    <AbsoluteFill>
      {/* Background Video */}
      <RemotionVideo
        src={backgroundVideo}
        startFrom={startFrom}
        endAt={endAt}
        muted={true}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: `blur(${backgroundBlurPx}px)`,
        }}
        delayRenderTimeoutInMilliseconds={60000}
      />

      {/* Audio and Character Sequences */}
      {audioPaths.map((audio, index) => {
        const characterAsset = assetLookup[audio.speaker];
        const startFrame = Math.floor((startTimes[index] ?? 0) * 30); // Convert to frames (30fps)
        const durationInFrames = Math.max(
          1,
          Math.ceil((durations[index] ?? 0) * 30),
        ); // Ensure minimum duration of 1 frame

        return (
          <>
            <Sequence
              key={audio.path}
              from={startFrame}
              durationInFrames={durationInFrames}
              premountFor={30}
            >
              <Audio src={staticFile(audio.path)} />
              {/* @ts-expect-error - characterAsset is not always defined */}
              {<CharacterImage {...characterAsset} />}
            </Sequence>
          </>
        );
      })}

      {/* Subtitles */}
      {transcript?.words.map((word, index) => {
        const startFrame = Math.floor(word.start * 30); // Convert to frames (30fps)
        const endFrame = Math.ceil(word.end * 30);

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={endFrame - startFrame}
          >
            <Subtitle text={word.text} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
