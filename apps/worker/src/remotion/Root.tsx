import React from "react";
import { getAudioData } from "@remotion/media-utils";
import { Composition, staticFile } from "remotion";

import type { VideoProps } from "./Video";
import { Video } from "./Video";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Video"
        component={Video as React.ComponentType}
        durationInFrames={300} // Default duration, will be overridden by calculateMetadata
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          audioPaths: [],
          delay: 0.5,
          assetLookup: {},
          transcript: {
            words: [],
          },
          devMode: false,
        }}
        calculateMetadata={async ({ props }) => {
          console.log(
            "=== calculateMetadata called with props:",
            JSON.stringify(props, null, 2),
          );
          const { audioPaths, delay, devMode } = props as unknown as VideoProps;

          if (!audioPaths.length) {
            console.log("=== No audio paths, returning default duration");
            return { durationInFrames: 300 }; // Default 10 seconds if no audio
          }

          // In dev mode, only render first 10 seconds
          if (devMode) {
            console.log("=== Dev mode, returning default duration");
            return { durationInFrames: 300 }; // 10 seconds at 30fps
          }

          console.log(
            "=== Starting audio duration calculation for",
            audioPaths.length,
            "files",
          );

          try {
            // Calculate total duration including delays
            const durations = await Promise.all(
              audioPaths.map(async (audio, index) => {
                console.log(
                  `=== Processing audio ${index + 1}/${audioPaths.length}:`,
                  audio.path,
                );
                try {
                  const audioData = await getAudioData(
                    "https://jk4bkzsv9s.ufs.sh/f/LP4p1g5t1nTxv1LndwEdxMSpW7GmVO0n3aNFoQckEbJCjePy",
                  );
                  console.log(
                    `=== Successfully got audio data for ${audio.path}: duration=${audioData.durationInSeconds}s`,
                  );
                  return audioData.durationInSeconds;
                } catch (error) {
                  console.error(
                    `=== Failed to get audio data for ${audio.path}:`,
                    error,
                  );
                  console.log(
                    `=== Using fallback duration of 5 seconds for ${audio.path}`,
                  );
                  // Return a default duration if audio data fails
                  return 5; // 5 seconds default
                }
              }),
            );

            console.log("=== All audio durations:", durations);

            const totalDuration =
              durations.reduce((acc, duration, index) => {
                return (
                  acc + duration + (index < durations.length - 1 ? delay : 0)
                );
              }, 0) + 2; // Add 2 second buffer

            console.log(
              "=== Calculated total duration:",
              totalDuration,
              "seconds",
            );
            const durationInFrames = Math.ceil(totalDuration * 30);
            console.log("=== Final duration in frames:", durationInFrames);

            return {
              durationInFrames,
            };
          } catch (error) {
            console.error("=== Error in calculateMetadata:", error);
            // Return default duration if everything fails
            console.log("=== Falling back to default 300 frames due to error");
            return { durationInFrames: 300 };
          }
        }}
      />
    </>
  );
};
