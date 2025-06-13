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
          const { audioPaths, delay, devMode } = props as unknown as VideoProps;

          if (!audioPaths.length) {
            return { durationInFrames: 300 }; // Default 10 seconds if no audio
          }

          // In dev mode, only render first 10 seconds
          if (devMode) {
            return { durationInFrames: 300 }; // 10 seconds at 30fps
          }

          // Calculate total duration including delays
          const durations = await Promise.all(
            audioPaths.map(async (audio) => {
              const audioData = await getAudioData(staticFile(audio.path));
              return audioData.durationInSeconds;
            }),
          );

          const totalDuration =
            durations.reduce((acc, duration, index) => {
              return (
                acc + duration + (index < durations.length - 1 ? delay : 0)
              );
            }, 0) + 2; // Add 2 second buffer

          return {
            durationInFrames: Math.ceil(totalDuration * 30), // Convert to frames at 30fps
          };
        }}
      />
    </>
  );
};
