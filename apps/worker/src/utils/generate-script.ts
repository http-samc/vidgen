import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod/v4";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";

export interface GenerateScriptData {
  prompt: string;
  id: string;
}

// Define the script line schema
export const ScriptLineSchema = z.object({
  speaker: z.enum(["Peter Griffin", "Stewie Griffin"]),
  text: z.string().min(1).max(1000),
});

export type ScriptLine = z.infer<typeof ScriptLineSchema>;

export async function generateScript(
  data: GenerateScriptData
): Promise<ScriptLine[]> {
  // Create temp directory if it doesn't exist
  const tempDir = join(process.cwd(), "temp", data.id);
  await mkdir(tempDir, { recursive: true });

  // Check if script already exists
  if (existsSync(join(tempDir, "script.json"))) {
    console.info("Using cached script");
    const file = await readFile(join(tempDir, "script.json"), "utf-8");

    return JSON.parse(file) as ScriptLine[];
  }

  console.info("Generating script for", data.id);

  const { object: script } = await generateObject({
    model: anthropic("claude-3-5-haiku-20241022"),
    schema: z.object({
      lines: z.array(ScriptLineSchema),
    }),
    prompt: `Generate a script for a video based on the following prompt: ${data.prompt}

  The script should follow these guidelines:
  1. The conversation MUST start with Stewie Griffin asking Peter Griffin a question about the topic
  2. Peter Griffin should be the main explaining character, using his characteristic simple and sometimes confused way of explaining things, but don't be afraid to get technical - Peter can explain complex concepts in his own unique way
  3. Stewie Griffin should ask follow-up questions and make occasional witty interjections, often using sophisticated vocabulary and technical terms
  4. The dialogue should feel natural and conversational, with Stewie's questions helping to break down complex topics into digestible pieces
  5. The total script should be between 30-60 seconds when spoken at a natural pace
  6. Each line should be concise and impactful
  7. Include some of Peter's characteristic "heh heh" or "oh boy" interjections
  8. Stewie should occasionally use his characteristic sophisticated vocabulary and British accent in his questions
  9. Don't shy away from technical details - Peter can explain complex concepts in his own unique way, and Stewie can ask about specific technical aspects

  Format the response as a series of alternating dialogue between Peter Griffin and Stewie Griffin, with Peter doing most of the explaining and Stewie helping to guide the conversation through questions. The first line MUST be Stewie asking a question.
  IMPORTANT: Make sure you always spell out speakers full names in the script, e.g. "Peter Griffin" and "Stewie Griffin".
  `,
  });

  // Save script to JSON file
  await writeFile(
    join(tempDir, "script.json"),
    JSON.stringify(script.lines, null, 2)
  );

  return script.lines;
}
