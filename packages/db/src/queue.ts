/* eslint-disable turbo/no-undeclared-env-vars */
import { Queue } from "bullmq";
import IoRedis from "ioredis";

export interface CreateVideoData {
  prompt: string;
  presetId: number;
  id: string;
  delay: number;
  userId: string;
  characterAssets: CharacterAssetLookup;
  backgroundVideo: string;

  devMode?: boolean; // When true, only render first 10 seconds
  backgroundBlur?: "none" | "medium" | "high";
}

export type CharacterAssetLookup = Record<
  string,
  {
    path: string;
    width: number;
    position: "left" | "right";
    voice: string;
    role: "teacher" | "student";
  }
>;

export type QueueData = Omit<CreateVideoData, "id">;
export interface QueueResult {
  url: string;
  title: string;
  description: string;
}

export const connection = new IoRedis(`${process.env.REDIS_URL}`, {
  maxRetriesPerRequest: null,
});

export const queue = new Queue<QueueData, QueueResult>(
  process.env.QUEUE_NAME ?? "vidgen",
  {
    connection,
  },
);
