import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { getAudioData } from "@remotion/media-utils";
import { staticFile } from "remotion";

interface VideoProps {
  audioPaths: string[];
  delay: number;
}

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
        }}
        calculateMetadata={async ({ props }) => {
          const { audioPaths, delay } = props as unknown as VideoProps;

          if (!audioPaths.length) {
            return { durationInFrames: 300 }; // Default 10 seconds if no audio
          }

          // Calculate total duration including delays
          const durations = await Promise.all(
            audioPaths.map(async (audioPath) => {
              const audioData = await getAudioData(staticFile(audioPath));
              return audioData.durationInSeconds;
            })
          );

          const totalDuration = durations.reduce((acc, duration, index) => {
            return acc + duration + (index < durations.length - 1 ? delay : 0);
          }, 0);

          return {
            durationInFrames: Math.ceil(totalDuration * 30), // Convert to frames at 30fps
          };
        }}
      />
    </>
  );
};
