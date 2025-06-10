import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";

interface VideoProps {
  audioPath: string;
}

export const Video: React.FC<VideoProps> = ({ audioPath }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Audio src={staticFile(audioPath)} />
    </AbsoluteFill>
  );
};
