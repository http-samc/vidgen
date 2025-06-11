import { generateScript } from "./utils/generate-script";
import { generateSpeechForScript } from "./utils/generate-speech";
import { generateVideo } from "./utils/generate-video";
import type { CharacterAssetLookup } from "./utils/generate-video";
import { generateTranscript } from "./utils/generate-transcript";
import { Worker } from "bullmq";
import { connection } from "./lib/bullmq";
import { CreateVideoData } from "./index";

export async function createVideo(data: CreateVideoData) {
  // Generate the script
  const script = await generateScript(data);

  // Generate speech for each line in the script
  const audioPaths = await generateSpeechForScript(
    script,
    data.id,
    Object.fromEntries(
      Object.entries(data.characterAssets).map(([key, value]) => [
        key,
        value.voice,
      ])
    )
  );

  if (!audioPaths.length) {
    throw new Error("No audio files were generated");
  }

  // Generate master transcript
  const transcript = await generateTranscript({
    audioPaths: audioPaths.map((audio) => audio.path),
    id: data.id,
    delay: data.delay,
  }).then((transcript) => ({
    ...transcript,
    words: transcript.words
      .filter((word) => word.type !== "spacing")
      .map((word) => ({
        text: word.text,
        start: word.start ?? 0,
        end: word.end ?? 0,
        type: word.type,
      })),
  }));

  // Generate the video
  const videoPath = await generateVideo({
    audioPaths,
    id: data.id,
    delay: data.delay,
    devMode: data.devMode,
    backgroundBlurPx:
      data.backgroundBlur === "none"
        ? undefined
        : data.backgroundBlur === "medium"
          ? 6
          : 12,
    assetLookup: data.characterAssets,
    transcript,
  });

  return { url: videoPath };
}

const worker = new Worker<Omit<CreateVideoData, "id">, { url: string }>(
  process.env.QUEUE_NAME!,
  async (job) => {
    return await createVideo({ ...job.data, id: job.id ?? job.name });
  },
  {
    connection: connection,
  }
);

worker.on("ready", () => {
  console.log("Worker ready");
});

worker.on("active", (job) => {
  console.log(`Job ${job.id} active`);
});

worker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed with result: ${result.url}`);
});

worker.on("failed", (job, error) => {
  console.log(`Job ${job?.id} failed with error: ${error}`);
});
