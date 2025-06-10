import { generateScript } from "./utils/generate-script";
import { generateSpeechForScript } from "./utils/generate-speech";
import { generateTranscript } from "./utils/generate-transcript";

export interface CreateVideoData {
  prompt: string;
  id: string;
  delay: number;
}

export async function createVideo(data: CreateVideoData): Promise<object> {
  // Generate the script
  const script = await generateScript(data);

  // Generate speech for each line in the script
  const audioPaths = await generateSpeechForScript(script, data.id);

  // Generate master transcript
  const transcript = await generateTranscript({
    audioPaths,
    id: data.id,
    delay: data.delay,
  });

  return {
    script,
    audioPaths,
    transcript,
  };
}

createVideo({
  id: "test",
  prompt: "How LLMs work",
  delay: 0.5,
}).then((result) => {});
