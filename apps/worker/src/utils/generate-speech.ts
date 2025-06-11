import { Readable } from "stream";
import { ScriptLine, ScriptLineSchema } from "./generate-script";
import elevenLabs from "../lib/elevenlabs";
import { join } from "path";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { pipeline } from "stream/promises";

export async function generateSpeech(
  scriptLine: ScriptLine,
  outputPath: string,
  voiceIdLookup: Record<string, string>
): Promise<{ path: string; speaker: string }> {
  // Validate the script line
  const validatedLine = ScriptLineSchema.parse(scriptLine);

  // Get the voice ID for the speaker
  const voiceId = voiceIdLookup[validatedLine.speaker]!;

  // Generate speech using ElevenLabs
  const audio = await elevenLabs.textToSpeech.convert(voiceId, {
    text: validatedLine.text,
    modelId: "eleven_flash_v2_5",
    voiceSettings: {
      stability: 0.7,
      similarityBoost: 0.8,
      speed: 1.05,
    },
    languageCode: "en",
  });

  // Save the audio stream to a file
  const writeStream = createWriteStream(outputPath);
  await pipeline(audio, writeStream);

  return {
    path: outputPath,
    speaker: validatedLine.speaker,
  };
}

interface AudioWithSpeaker {
  path: string;
  speaker: string;
}

export async function generateSpeechForScript(
  script: ScriptLine[],
  id: string,
  voiceIdLookup: Record<string, string>
): Promise<AudioWithSpeaker[]> {
  const tempDir = join(process.cwd(), "public", id);

  // Create the public/:id directory if it doesn't exist
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  // Generate speech for each line in parallel
  const audioPaths = await Promise.all(
    script.map((line, index) => {
      const outputPath = join(tempDir, `${index}_${line.speaker}.mp3`);
      if (existsSync(outputPath)) {
        console.log("Found cached speech for", index, line.speaker);
        return {
          path: outputPath,
          speaker: line.speaker,
        };
      }
      console.info("Generating speech for", line.speaker, index);
      return generateSpeech(line, outputPath, voiceIdLookup);
    })
  );

  return audioPaths;
}
