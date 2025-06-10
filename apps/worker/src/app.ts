import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";

export interface CreateVideoData {
  prompt: string;
  id: string;
  delay: number;
}

export async function createVideo(data: CreateVideoData): Promise<object> {
  // Bundle the Remotion project
  const bundled = await bundle("./src/remotion/index.ts");

  // Get the composition configuration
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "Video",
  });

  // Render the video
  const outputPath = path.join("out", `${data.id}.mp4`);
  await renderMedia({
    codec: "h264",
    serveUrl: bundled,
    outputLocation: outputPath,
    composition,
  });

  return {
    videoPath: outputPath,
  };
}

// Test code
createVideo({
  id: "test",
  prompt: "How LLMs work",
  delay: 0.5,
}).then((result) => {});
