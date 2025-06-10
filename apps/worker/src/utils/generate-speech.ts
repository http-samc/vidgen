import { Readable } from "stream";
import { ScriptLine, ScriptLineSchema } from "./generate-script.js";
import elevenLabs from "../lib/elevenlabs.js";

// Define the voice IDs for each character
const VOICE_IDS = {
  "Peter Griffin": "IRHApOXLvnW57QJPQH2P",
  "Stewie Griffin": "Mu5jxyqZOLIGltFpfalg",
  "Brian Griffin": "ZSHzpa6aUvhjzShiBmYw",
} as const;

export async function generateSpeech(
  scriptLine: ScriptLine
): Promise<Readable> {
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

  return audio;
}

export async function generateSpeechForScript(
  script: ScriptLine[]
): Promise<Readable[]> {
  // Generate speech for each line in parallel
  const audioStreams = await Promise.all(
    script.map((line) => generateSpeech(line))
  );

  return audioStreams;
}
