import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Initialize the ElevenLabs client
const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export default elevenLabs;
