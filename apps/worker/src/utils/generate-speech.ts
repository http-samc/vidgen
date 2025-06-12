import { createWriteStream, existsSync, mkdirSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import { pipeline } from "stream/promises";
import { UTApi } from "uploadthing/server";

import type { ScriptLine } from "./generate-script";
import elevenLabs from "../lib/elevenlabs";
import { ScriptLineSchema } from "./generate-script";

const utapi = new UTApi();

async function uploadAudioToUploadThing(
  audioPath: string,
  id: string,
  index: number,
  speaker: string,
) {
  const fileBuffer = await readFile(audioPath);
  const file = new File([fileBuffer], `${id}_${index}_${speaker}.mp3`, {
    type: "audio/mpeg",
  });
  const uploadedFile = await utapi.uploadFiles(file);

  if (!uploadedFile.data) {
    throw new Error("Failed to upload audio to UploadThing");
  }

  return uploadedFile.data.ufsUrl;
}

export interface AudioWithSpeaker {
  path: string;
  url: string;
  speaker: string;
}

export async function generateSpeech(
  scriptLine: ScriptLine,
  outputPath: string,
  voiceIdLookup: Record<string, string>,
  id: string,
  index: number,
): Promise<AudioWithSpeaker> {
  // Validate the script line
  const validatedLine = ScriptLineSchema.parse(scriptLine);

  // Get the voice ID for the speaker
  const voiceId = voiceIdLookup[validatedLine.speaker];

  if (!voiceId) {
    throw new Error(`Voice ID not found for speaker: ${validatedLine.speaker}`);
  }

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

  // Upload to UploadThing
  const url = await uploadAudioToUploadThing(
    outputPath,
    id,
    index,
    validatedLine.speaker,
  );

  return {
    path: outputPath,
    url,
    speaker: validatedLine.speaker,
  };
}

export async function generateSpeechForScript(
  script: ScriptLine[],
  id: string,
  voiceIdLookup: Record<string, string>,
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
        return uploadAudioToUploadThing(
          outputPath,
          id,
          index,
          line.speaker,
        ).then((url) => ({
          path: outputPath,
          url,
          speaker: line.speaker,
        }));
      }
      console.info("Generating speech for", line.speaker, index);
      return generateSpeech(line, outputPath, voiceIdLookup, id, index);
    }),
  );

  if (!audioPaths.length) {
    throw new Error("No audio files were generated");
  }

  return audioPaths;
}
