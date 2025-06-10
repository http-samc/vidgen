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
  devMode?: boolean; // When true, only render first 10 seconds
  backgroundBlurPx?: number; // Blur amount for background video
}

const CharacterAssetLookup = {
  "Peter Griffin": {
    path: "peter.png",
    width: 400,
    position: "left",
  },
  "Stewie Griffin": {
    path: "stewie.png",
    width: 300,
    position: "right",
  },
} as const;

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
    audioPaths: audioPaths.map((audio) => audio.path),
    id: data.id,
    delay: data.delay,
  });

  console.log("Generating video");

  // Bundle the Remotion project
  const bundled = await bundle("./src/remotion/index.ts");

  // Convert all audio paths to be relative to public directory
  const relativeAudioPaths = audioPaths.map((audio) => ({
    path: `${data.id}/${path.basename(audio.path)}`,
    speaker: audio.speaker,
  }));

  // Get the composition configuration
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "Video",
    inputProps: {
      audioPaths: relativeAudioPaths,
      delay: data.delay,
      transcript,
      assetLookup: CharacterAssetLookup,
      devMode: data.devMode,
      backgroundBlurPx: data.backgroundBlurPx,
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
      audioPaths: relativeAudioPaths,
      delay: data.delay,
      transcript,
      assetLookup: CharacterAssetLookup,
      devMode: data.devMode,
      backgroundBlurPx: data.backgroundBlurPx,
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
  devMode: true, // Enable dev mode for faster iteration
  backgroundBlurPx: 12, // Add blur to background
}).then((result) => {});
