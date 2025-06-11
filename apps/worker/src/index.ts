import type { CharacterAssetLookup } from "./utils/generate-video";

export interface CreateVideoData {
  prompt: string;
  id: string;
  delay: number;
  // backgroundVideo: string;
  characterAssets: CharacterAssetLookup;
  devMode?: boolean; // When true, only render first 10 seconds
  backgroundBlur?: "none" | "medium" | "high";
}
