import { generateScript } from "./utils/generate-script";
import { generateSpeechForScript } from "./utils/generate-speech";
import { generateTranscript } from "./utils/generate-transcript";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";

export interface CreateVideoData {
  prompt: string;
  id: string;
  delay: number;
}

export async function createVideo(data: CreateVideoData): Promise<object> {
  // Generate the script
  const script = await generateScript(data);

  // Generate speech for each line in the script
  const audioPaths = await generateSpeechForScript(script, data.id);

  if (!audioPaths.length) {
    throw new Error("No audio files were generated");
  }

  // Generate master transcript
  const transcript = await generateTranscript({
    audioPaths,
    id: data.id,
    delay: data.delay,
  });

  // Bundle the Remotion project
  const bundled = await bundle("./src/remotion/index.ts");

  const relativeAudioPath = `${data.id}/${path.basename(audioPaths[0]!)}`;

  console.log("relativeAudioPath", relativeAudioPath);

  // Get the composition configuration
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "Video",
    inputProps: {
      audioPath: relativeAudioPath,
    },
  });

  // Render the video
  const outputPath = path.join("out", `${data.id}.mp4`);
  await renderMedia({
    codec: "h264",
    serveUrl: bundled,
    outputLocation: outputPath,
    composition,
    inputProps: {
      audioPath: relativeAudioPath,
    },
  });

  return {
    script,
    audioPaths,
    transcript,
    videoPath: outputPath,
  };
}

// Test code
createVideo({
  id: "test",
  prompt: "How LLMs work",
  delay: 0.5,
}).then((result) => {});
