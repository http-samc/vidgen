import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { getAudioData } from "@remotion/media-utils";

interface Word {
  text: string;
  start: number;
  end: number;
}

interface VideoProps {
  audioPaths: string[];
  delay: number;
  transcript?: {
    words: Word[];
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
        color: "white",
        fontSize: "48px",
        fontFamily: "Arial",
        textAlign: "center",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
        maxWidth: "80%",
        padding: "20px",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: "10px",
      }}
    >
      {text}
    </div>
  );
};

export const Video: React.FC<VideoProps> = ({
  audioPaths,
  delay,
  transcript,
}) => {
  const [startTimes, setStartTimes] = React.useState<number[]>([]);
  const currentFrame = useCurrentFrame();
  const currentTime = currentFrame / 30; // Convert frames to seconds

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

  // Find the current word based on timing
  const currentWord = transcript?.words.find(
    (word) => currentTime >= word.start - 0.2 && currentTime <= word.end + 0.2
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
      {currentWord && <Subtitle text={currentWord.text} />}
    </AbsoluteFill>
  );
};
