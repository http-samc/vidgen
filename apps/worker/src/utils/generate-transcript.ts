import { SpeechToTextWordResponseModel } from "@elevenlabs/elevenlabs-js/api";
import elevenLabs from "../lib/elevenlabs";
import { createReadStream, existsSync } from "fs";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";

interface TranscriptGenerationData {
  audioPaths: string[];
  id: string;
  delay: number;
}

export async function generateTranscript({
  audioPaths,
  id,
  delay,
}: TranscriptGenerationData) {
  // Check if transcript already exists
  const transcriptPath = join(process.cwd(), "temp", id, "transcript.json");
  if (existsSync(transcriptPath)) {
    console.warn("Transcript already exists, skipping transcription");
    const content = await readFile(transcriptPath, "utf-8");
    return JSON.parse(content);
  }

  // Transcribe each audio file
  const transcripts = await Promise.all(
    audioPaths.map(async (path) => {
      const audioStream = createReadStream(path);
      console.log("Transcribing", path);
      const response = await elevenLabs.speechToText.convert({
        file: audioStream,
        modelId: "scribe_v1",
        languageCode: "en",
      });
      console.log("Generated transcript for ", path);

      return response;
    })
  );

  // Calculate cumulative durations for timestamp adjustments
  let cumulativeDuration = 0;
  const mergedWords: SpeechToTextWordResponseModel[] = [];

  // Merge transcripts and adjust timestamps
  for (const transcript of transcripts) {
    // Adjust timestamps for each word
    const adjustedWords = transcript.words.map((word) => ({
      ...word,
      start: (word.start ?? 0) + cumulativeDuration + delay,
      end: (word.end ?? 0) + cumulativeDuration + delay,
    }));

    mergedWords.push(...adjustedWords);

    // Update cumulative duration for next transcript
    const lastWord = transcript.words[transcript.words.length - 1];
    if (lastWord?.end) {
      cumulativeDuration = lastWord.end + delay;
    }
  }

  // Create the final merged transcript
  const mergedTranscript = {
    text: mergedWords.map((word) => word.text).join(""),
    words: mergedWords,
  };

  // Save the merged transcript to a JSON file
  const tempDir = join(process.cwd(), "temp", id);
  await writeFile(
    join(tempDir, "transcript.json"),
    JSON.stringify(mergedTranscript, null, 2)
  );

  return mergedTranscript;
}
