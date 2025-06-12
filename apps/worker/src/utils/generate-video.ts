import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

import type { CharacterAssetLookup } from "@acme/db/queue";

export interface GenerateVideoData {
  audioPaths: {
    path: string;
    url: string;
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

  // Bundle the Remotion project
  const bundled = await bundle("./src/remotion/index.ts");

  // Use the hosted URLs from UploadThing
  const audioPaths = data.audioPaths.map((audio) => ({
    path: audio.url,
    speaker: audio.speaker,
  }));

  // Get the composition configuration
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "Video",
    inputProps: {
      audioPaths,
      delay: data.delay,
      transcript: data.transcript,
      assetLookup: data.assetLookup,
      devMode: data.devMode,
      backgroundBlurPx: data.backgroundBlurPx,
      backgroundVideo: data.backgroundVideo,
    },
    chromiumOptions: {
      disableWebSecurity: true,
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
      audioPaths,
      delay: data.delay,
      transcript: data.transcript,
      assetLookup: data.assetLookup,
      devMode: data.devMode,
      backgroundBlurPx: data.backgroundBlurPx,
      backgroundVideo: data.backgroundVideo,
    },
    chromiumOptions: {
      disableWebSecurity: true,
    },
  });

  return outputPath;
}
