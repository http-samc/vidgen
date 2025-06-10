import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { getAudioData } from "@remotion/media-utils";

interface VideoProps {
  audioPaths: string[];
  delay: number;
}

export const Video: React.FC<VideoProps> = ({ audioPaths, delay }) => {
  const [startTimes, setStartTimes] = React.useState<number[]>([]);

  React.useEffect(() => {
    const calculateStartTimes = async () => {
      // Get durations for all audio files
      const durations = await Promise.all(
        audioPaths.map(async (audioPath) => {
          const audioData = await getAudioData(staticFile(audioPath));
          return audioData.durationInSeconds;
        })
      );

      // Calculate start times based on cumulative durations and delays
      const times = durations.reduce<number[]>((acc, duration, index) => {
        const previousStart = index === 0 ? 0 : (acc[index - 1] ?? 0);
        const previousDuration = index === 0 ? 0 : (durations[index - 1] ?? 0);
        return [
          ...acc,
          previousStart + previousDuration + (index === 0 ? 0 : delay),
        ];
      }, []);

      setStartTimes(times);
    };

    calculateStartTimes();
  }, [audioPaths, delay]);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {audioPaths.map((audioPath, index) => (
        <Sequence
          key={audioPath}
          from={Math.floor((startTimes[index] ?? 0) * 30)} // Convert seconds to frames at 30fps
        >
          <Audio src={staticFile(audioPath)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
