import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { getAudioData } from "@remotion/media-utils";

interface VideoProps {
  audioPaths: string[];
  delay: number;
}

export const Video: React.FC<VideoProps> = ({ audioPaths, delay }) => {
  const [durations, setDurations] = React.useState<number[]>([]);
  const [totalDuration, setTotalDuration] = React.useState(0);

  React.useEffect(() => {
    const loadDurations = async () => {
      const audioDurations = await Promise.all(
        audioPaths.map(async (audioPath) => {
          const audioData = await getAudioData(staticFile(audioPath));
          return audioData.durationInSeconds;
        })
      );
      setDurations(audioDurations);

      // Calculate total duration including delays
      const total = audioDurations.reduce(
        (acc: number, duration: number, index: number) => {
          return (
            acc + duration + (index < audioDurations.length - 1 ? delay : 0)
          );
        },
        0
      );
      setTotalDuration(total);
    };

    loadDurations();
  }, [audioPaths, delay]);

  // Calculate start times for each audio file
  const startTimes = durations.reduce<number[]>(
    (acc: number[], duration: number, index: number) => {
      const previousStart = index === 0 ? 0 : (acc[index - 1] ?? 0);
      const previousDuration = index === 0 ? 0 : (durations[index - 1] ?? 0);
      return [
        ...acc,
        previousStart + previousDuration + (index === 0 ? 0 : delay),
      ];
    },
    []
  );

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
