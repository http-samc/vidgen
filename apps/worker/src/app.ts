import generateScript from "./lib/generate-script";

export interface CreateVideoData {
  prompt: string;
}

export async function createVideo(data: CreateVideoData) {
  const script = await generateScript(data);
  return script;
}

createVideo({
  prompt: "How LLMs work",
}).then((script) => console.log(JSON.stringify(script, null, 2)));
