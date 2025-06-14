/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { rm } from "fs/promises";
import { join } from "path";
import { Worker } from "bullmq";

import type { CreateVideoData, QueueData, QueueResult } from "@acme/db/queue";
import { db } from "@acme/db/client";
import { video } from "@acme/db/schema";

import { connection } from "./lib/bullmq";
import { generateScript } from "./utils/generate-script";
import { generateSpeechForScript } from "./utils/generate-speech";
import { generateTranscript } from "./utils/generate-transcript";
import { generateVideo } from "./utils/generate-video";
import { uploadVideoToUploadThing } from "./utils/upload-video";

interface JobProgress {
  state: string;
  progress: number;
}

export async function createVideo(
  data: CreateVideoData,
  updateProgress: (progress: JobProgress) => Promise<void>,
) {
  // Generate the script
  await updateProgress({ state: "Generating script...", progress: 10 });
  const { lines: script, title, description } = await generateScript(data);

  // Generate speech for each line in the script
  await updateProgress({ state: "Generating speech...", progress: 30 });
  const audioPaths = await generateSpeechForScript(
    script,
    data.id,
    Object.fromEntries(
      Object.entries(data.characterAssets).map(([key, value]) => [
        key,
        value.voice,
      ]),
    ),
  );

  // Generate master transcript
  await updateProgress({ state: "Generating transcript...", progress: 40 });
  const transcript = await generateTranscript({
    audioPaths: audioPaths.map((audio) => audio.path),
    id: data.id,
    delay: data.delay,
  });

  // Generate the video
  await updateProgress({ state: "Generating video...", progress: 50 });
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
    backgroundVideo: data.backgroundVideo,
  });

  // Upload the video to UploadThing
  await updateProgress({ state: "Uploading video...", progress: 85 });
  const url = await uploadVideoToUploadThing(videoPath, data.id);

  // Clean up the production artifacts
  await updateProgress({
    state: "Cleaning up temporary files...",
    progress: 95,
  });
  await Promise.all([
    rm(join(process.cwd(), "temp", data.id), { recursive: true, force: true }),
    rm(join(process.cwd(), "public", data.id), {
      recursive: true,
      force: true,
    }),
  ]);

  await db.insert(video).values({
    id: data.id,
    url,
    title,
    description,
    userId: data.userId,
    presetId: data.presetId,
  });

  await updateProgress({ state: "Video generation complete", progress: 100 });

  return { url, title, description };
}

const worker = new Worker<QueueData, QueueResult>(
  process.env.QUEUE_NAME!,
  async (job) => {
    const updateProgress = async (progress: JobProgress) => {
      // Store both progress and state in the progress object
      await job.updateProgress({
        progress: progress.progress,
        state: progress.state,
      });
    };

    return await createVideo(
      { ...job.data, id: job.id ?? job.name },
      updateProgress,
    );
  },
  {
    connection: connection,
  },
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
