import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod/v4";

import type { CharacterAssetLookup } from "@acme/db/queue";

export interface GenerateScriptData {
  prompt: string;
  characterAssets: CharacterAssetLookup;
  id: string;
}

// Define the script line schema
export const ScriptLineSchema = z.object({
  speaker: z.string(),
  text: z.string().min(1).max(1000),
});

export const ScriptSchema = z.object({
  title: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  lines: z.array(ScriptLineSchema),
});

export type ScriptLine = z.infer<typeof ScriptLineSchema>;
export type Script = z.infer<typeof ScriptSchema>;

export async function generateScript(
  data: GenerateScriptData,
): Promise<Script> {
  let teacher: string | null = null;
  const students: string[] = [];

  for (const [name, { role }] of Object.entries(data.characterAssets)) {
    if (role === "teacher") {
      teacher = name;
    } else {
      students.push(name);
    }
  }

  console.log("teacher", teacher);
  console.log("students", students);

  if (!teacher || students.length === 0) {
    throw new Error("Invalid character assets");
  }

  const studentsString = students.join(" or ");

  // Create temp directory if it doesn't exist
  const tempDir = join(process.cwd(), "temp", data.id);
  await mkdir(tempDir, { recursive: true });

  // Check if script already exists
  if (existsSync(join(tempDir, "script.json"))) {
    console.info("Using cached script");
    const file = await readFile(join(tempDir, "script.json"), "utf-8");

    return JSON.parse(file) as Script;
  }

  console.info("Generating script for", data.id);

  const { object: script } = await generateObject({
    model: anthropic("claude-3-5-haiku-20241022"),
    schema: ScriptSchema,
    prompt: `Generate a script for a video based on the following prompt: ${data.prompt}

  The script should follow these guidelines:
  1. The conversation MUST start with  asking ${teacher} a question about the topic
  2. ${teacher} should be the main explaining character, using his characteristic simple and sometimes confused way of explaining things, but don't be afraid to get technical - ${teacher} can explain complex concepts in his own unique way
  3. ${studentsString} should ask follow-up questions and make occasional witty interjections, often using sophisticated vocabulary and technical terms
  4. The dialogue should feel natural and conversational, with ${studentsString}'s questions helping to break down complex topics into digestible pieces
  5. The total script should be between 30-60 seconds when spoken at a natural pace
  6. Each line should be concise and impactful
  7. Include some of ${teacher}'s characteristic interjections
  8. ${studentsString} should occasionally use his characteristic vocabulary and interjections
  9. Don't shy away from technical details - ${teacher} can explain complex concepts in his own unique way, and ${studentsString} can ask about specific technical aspects
  10. Include a brief title less than 50 characters (that shouldn't include anything about the characters' background, just the topic) and description that stays high level while giving a sense of the content (less than 200 characters)
  Format the response as a series of alternating dialogue between ${teacher} and ${studentsString}, with ${teacher} doing most of the explaining and ${studentsString} helping to guide the conversation through questions. The first line MUST be ${studentsString} asking a question.
  IMPORTANT: Make sure you always spell out speakers full names in the script, e.g. "${teacher}" and ${students.map((s) => `"${s}"`).join(", ")}.
  `,
  });

  // Save script to JSON file
  await writeFile(
    join(tempDir, "script.json"),
    JSON.stringify(script, null, 2),
  );

  return script;
}
