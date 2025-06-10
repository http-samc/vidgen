import { generateScript } from "./utils/generate-script.js";
import { generateSpeechForScript } from "./utils/generate-speech.js";
import { Readable } from "stream";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";

export interface CreateVideoData {
  prompt: string;
  id: string;
}

export interface CreateVideoResponse {
  script: Array<{
    speaker: "Peter Griffin" | "Stewie Griffin" | "Brian Griffin";
    text: string;
  }>;
  audioStreams: Readable[];
}

export async function createVideo(
  data: CreateVideoData
): Promise<CreateVideoResponse> {
  // Create temp directory if it doesn't exist
  const tempDir = join(process.cwd(), "temp", data.id);
  await mkdir(tempDir, { recursive: true });

  // Generate the script
  const script = await generateScript(data);

  // Save script to JSON file
  await writeFile(
    join(tempDir, "script.json"),
    JSON.stringify(script, null, 2)
  );

  // Generate speech for each line in the script
  const audioStreams = await generateSpeechForScript(script);

  // Save each audio stream to an MP3 file
  await Promise.all(
    audioStreams.map(async (stream, index) => {
      const scriptLine = script[index];
      if (!scriptLine) {
        throw new Error(
          `No script line found for audio stream at index ${index}`
        );
      }
      const outputPath = join(tempDir, `${index}_${scriptLine.speaker}.mp3`);
      const writeStream = createWriteStream(outputPath);
      await pipeline(stream, writeStream);
    })
  );

  return {
    script,
    audioStreams,
  };
}

createVideo({
  id: "test",
  prompt: "How LLMs work",
}).then((script) => console.log(JSON.stringify(script, null, 2)));
