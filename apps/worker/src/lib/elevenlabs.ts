/* eslint-disable turbo/no-undeclared-env-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Initialize the ElevenLabs client
const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY!,
});

export default elevenLabs;
