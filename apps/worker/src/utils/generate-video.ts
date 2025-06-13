import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

import type { CharacterAssetLookup } from "@acme/db/queue";

export interface GenerateVideoData {
  audioPaths: {
    path: string;
    speaker: string;
  }[];
  id: string;
  delay: number;
  devMode?: boolean;
  backgroundBlurPx?: number;
  backgroundVideo: string;
  assetLookup: CharacterAssetLookup;
  transcript: {
    words: {
      text: string;
      start: number;
      end: number;
      type?: string;
    }[];
  };
}

export async function generateVideo(data: GenerateVideoData): Promise<string> {
  console.log("Generating video");
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Audio paths:", data.audioPaths);

  // Bundle the Remotion project
  const bundled = await bundle("./src/remotion/index.ts");

  // Convert all audio paths to be relative to public directory
  const relativeAudioPaths = data.audioPaths.map((audio) => ({
    path: `${data.id}/${path.basename(audio.path)}`,
    speaker: audio.speaker,
  }));

  console.log("Relative audio paths:", relativeAudioPaths);

  // Get the composition configuration
  console.log("=== Starting selectComposition...");
  try {
    const composition = await selectComposition({
      serveUrl: bundled,
      id: "Video",
      inputProps: {
        audioPaths: relativeAudioPaths,
        delay: data.delay,
        transcript: data.transcript,
        assetLookup: data.assetLookup,
        devMode: data.devMode,
        backgroundBlurPx: data.backgroundBlurPx,
        backgroundVideo: data.backgroundVideo,
      },
    });
    console.log("=== selectComposition completed successfully");
    console.log("Composition details:", {
      id: composition.id,
      width: composition.width,
      height: composition.height,
      fps: composition.fps,
      durationInFrames: composition.durationInFrames,
    });

    // Render the video
    console.log("=== Starting renderMedia...");
    const outputPath = path.join("out", `${data.id}.mp4`);
    await renderMedia({
      codec: "h264",
      serveUrl: bundled,
      outputLocation: outputPath,
      composition,
      inputProps: {
        audioPaths: relativeAudioPaths,
        delay: data.delay,
        transcript: data.transcript,
        assetLookup: data.assetLookup,
        devMode: data.devMode,
        backgroundBlurPx: data.backgroundBlurPx,
        backgroundVideo: data.backgroundVideo,
      },
      timeoutInMilliseconds: 1000 * 60 * 5,
    });
    console.log("=== renderMedia completed successfully");

    return outputPath;
  } catch (error) {
    console.error("=== Error during video generation:", error);
    throw error;
  }
}
