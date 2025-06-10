import { Readable } from "stream";
import { ScriptLine, ScriptLineSchema } from "./generate-script";
import elevenLabs from "../lib/elevenlabs";
import { join } from "path";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";

// Define the voice IDs for each character
const VOICE_IDS = {
  "Peter Griffin": "IRHApOXLvnW57QJPQH2P",
  "Stewie Griffin": "Mu5jxyqZOLIGltFpfalg",
  "Brian Griffin": "ZSHzpa6aUvhjzShiBmYw",
} as const;

export async function generateSpeech(
  scriptLine: ScriptLine,
  outputPath: string
): Promise<string> {
  console.log("Generating speech for", scriptLine);
  // Validate the script line
  const validatedLine = ScriptLineSchema.parse(scriptLine);

  // Get the voice ID for the speaker
  const voiceId = VOICE_IDS[validatedLine.speaker];

  // Generate speech using ElevenLabs
  const audio = await elevenLabs.textToSpeech.convert(voiceId, {
    text: validatedLine.text,
    modelId: "eleven_flash_v2_5",
    voiceSettings: {
      stability: 0.7,
      similarityBoost: 0.8,
    },
    languageCode: "en",
  });

  // Save the audio stream to a file
  const writeStream = createWriteStream(outputPath);
  await pipeline(audio, writeStream);

  console.log("Generated speech for", scriptLine);
  return outputPath;
}

export async function generateSpeechForScript(
  script: ScriptLine[],
  id: string
): Promise<string[]> {
  // const tempDir = join(process.cwd(), "public", id);

  // // Generate speech for each line in parallel
  // const audioPaths = await Promise.all(
  //   script.map((line, index) => {
  //     const outputPath = join(tempDir, `${index}_${line.speaker}.mp3`);
  //     return generateSpeech(line, outputPath);
  //   })
  // );

  const audioPaths = [
    "/Users/smrth/dev/vidgen/apps/worker/public/test/0_Peter Griffin.mp3",
    "/Users/smrth/dev/vidgen/apps/worker/public/test/1_Stewie Griffin.mp3",
    "/Users/smrth/dev/vidgen/apps/worker/public/test/2_Peter Griffin.mp3",
    "/Users/smrth/dev/vidgen/apps/worker/public/test/3_Stewie Griffin.mp3",
    "/Users/smrth/dev/vidgen/apps/worker/public/test/4_Peter Griffin.mp3",
    "/Users/smrth/dev/vidgen/apps/worker/public/test/5_Stewie Griffin.mp3",
    "/Users/smrth/dev/vidgen/apps/worker/public/test/6_Peter Griffin.mp3",
    "/Users/smrth/dev/vidgen/apps/worker/public/test/7_Stewie Griffin.mp3",
  ];

  return audioPaths;
}
