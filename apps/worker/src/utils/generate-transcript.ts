import {
  SpeechToTextChunkResponseModel,
  SpeechToTextWordResponseModel,
} from "@elevenlabs/elevenlabs-js/api";
import elevenLabs from "../lib/elevenlabs";
import { createReadStream, existsSync } from "fs";
import { writeFile, readFile } from "fs/promises";
import { basename, join } from "path";

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
  const transcripts = await Promise.all(
    audioPaths.map(async (path) => {
      const transcriptPath = join(
        process.cwd(),
        "temp",
        id,
        `${basename(path)}.json`
      );
      if (existsSync(transcriptPath)) {
        // Use cached transcript
        const content = await readFile(transcriptPath, "utf-8");
        console.log("Found cached transcript for ", path);
        return JSON.parse(content) as SpeechToTextChunkResponseModel;
      } else {
        // Transcribe the audio file if it doesn't exist
        const audioStream = createReadStream(path);

        console.info("Transcribing", path);
        const response = await elevenLabs.speechToText.convert({
          file: audioStream,
          modelId: "scribe_v1",
          languageCode: "en",
        });

        console.log("Generated transcript for ", path);
        await writeFile(transcriptPath, JSON.stringify(response, null, 2));
        return response;
      }
    })
  );

  // Calculate cumulative durations for timestamp adjustments
  let currentTime = 0;
  const mergedWords: SpeechToTextWordResponseModel[] = [];

  // Merge transcripts and adjust timestamps
  for (let i = 0; i < transcripts.length; i++) {
    const transcript = transcripts[i];
    if (!transcript) continue;

    // Adjust timestamps for each word in the current transcript
    const adjustedWords = transcript.words.map((word) => ({
      ...word,
      start: (word.start ?? 0) + currentTime,
      end: (word.end ?? 0) + currentTime,
    }));

    mergedWords.push(...adjustedWords);

    // Update currentTime for next transcript
    // Add the duration of the last word plus the delay
    const lastWord = transcript.words[transcript.words.length - 1];
    if (lastWord?.end) {
      currentTime = lastWord.end + currentTime + 2 * delay;
    }
  }

  const windowSize = 2;
  const words: {
    start: number;
    end: number;
    text: string;
  }[] = [];
  for (
    let i = 0;
    i < Math.ceil(mergedWords[mergedWords.length - 1]!.end! / windowSize);
    i++
  ) {
    const windowStart = i * windowSize;
    const windowEnd = windowStart + windowSize;
    const windowWords = mergedWords.filter(
      (word) => word.start! >= windowStart && word.start! < windowEnd
    );
    const windowText = windowWords
      .map((word) => word.text.trim())
      .filter((text) => !!text)
      .join(" ")
      .trim();
    words.push({
      start: windowStart,
      end: windowEnd,
      text: windowText,
    });
  }

  // Create the final merged transcript
  const mergedTranscript = {
    text: words.map((word) => word.text).join(""),
    words,
  };

  // Save the merged transcript to a JSON file
  const tempDir = join(process.cwd(), "temp", id);
  await writeFile(
    join(tempDir, "transcript.json"),
    JSON.stringify(mergedTranscript, null, 2)
  );

  return mergedTranscript;
}
