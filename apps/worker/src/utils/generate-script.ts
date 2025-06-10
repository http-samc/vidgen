// import { generateObject } from "ai";
// import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod/v4";

export interface GenerateScriptData {
  prompt: string;
}

// Define the script line schema
export const ScriptLineSchema = z.object({
  speaker: z.enum(["Peter Griffin", "Stewie Griffin", "Brian Griffin"]),
  text: z.string().min(1).max(1000),
});

export type ScriptLine = z.infer<typeof ScriptLineSchema>;

export async function generateScript(
  data: GenerateScriptData
): Promise<ScriptLine[]> {
  //   const { object: script } = await generateObject({
  //     model: anthropic("claude-3-5-haiku-20241022"),
  //     schema: z.object({
  //       lines: z.array(ScriptLineSchema),
  //     }),
  //     prompt: `Generate a script for a video based on the following prompt: ${data.prompt}

  // The script should follow these guidelines:
  // 1. The conversation MUST start with Stewie asking Peter a question about the topic
  // 2. Peter Griffin should be the main explaining character, using his characteristic simple and sometimes confused way of explaining things, but don't be afraid to get technical - Peter can explain complex concepts in his own unique way
  // 3. Stewie Griffin should ask follow-up questions and make occasional witty interjections, often using sophisticated vocabulary and technical terms
  // 4. The dialogue should feel natural and conversational, with Stewie's questions helping to break down complex topics into digestible pieces
  // 5. The total script should be between 30-60 seconds when spoken at a natural pace
  // 6. Each line should be concise and impactful
  // 7. Include some of Peter's characteristic "heh heh" or "oh boy" interjections
  // 8. Stewie should occasionally use his characteristic sophisticated vocabulary and British accent in his questions
  // 9. Don't shy away from technical details - Peter can explain complex concepts in his own unique way, and Stewie can ask about specific technical aspects

  // Format the response as a series of alternating dialogue between Peter and Stewie, with Peter doing most of the explaining and Stewie helping to guide the conversation through questions. The first line MUST be Stewie asking a question.`,
  //   });

  // Sample generation—avoiding burning API credits while testing other parts of the app
  const script: { lines: ScriptLine[] } = {
    lines: [
      {
        speaker: "Peter Griffin" as const,
        text: "Alright, so LLMs - that's Large Language Models - are like super-smart computer brains, heh heh!",
      },
      {
        speaker: "Stewie Griffin" as const,
        text: "Pray tell, father, how exactly do these 'computer brains' process information?",
      },
      {
        speaker: "Peter Griffin" as const,
        text: "Oh boy, it's like they eat tons of text - books, websites, everything - and then they learn how words go together.",
      },
      {
        speaker: "Stewie Griffin" as const,
        text: "So essentially a massive neural network consuming linguistic data and extrapolating patterns? Fascinating.",
      },
      {
        speaker: "Peter Griffin" as const,
        text: "Exactly! They predict what word comes next, just like how I predict which sandwich I'll eat, heh heh!",
      },
      {
        speaker: "Stewie Griffin" as const,
        text: "And I suppose these models can generate human-like text based on probabilistic language modeling?",
      },
      {
        speaker: "Peter Griffin" as const,
        text: "Wow, you said it! They can write stories, answer questions, even do math. It's like magic, but with computers!",
      },
      {
        speaker: "Stewie Griffin" as const,
        text: "How delightfully reductive, yet surprisingly accurate.",
      },
    ],
  };

  return script.lines;
}
