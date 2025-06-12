import type { CharacterAssetLookup } from "@acme/db/queue";

export interface CreateVideoData {
  prompt: string;
  id: string;
  delay: number;
  // backgroundVideo: string;
  characterAssets: CharacterAssetLookup;
  devMode?: boolean; // When true, only render first 10 seconds
  backgroundBlur?: "none" | "medium" | "high";
}
