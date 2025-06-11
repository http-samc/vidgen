/* eslint-disable turbo/no-undeclared-env-vars */
import styles from "./page.module.css";
import { Queue } from "bullmq";
import { connection } from "../lib/bullmq";
import { CreateVideoData } from "@vidgen/worker";
import { VideoForm } from "./components/VideoForm";
import { redirect } from "next/navigation";

async function createVideo(prompt: string) {
  "use server";

  const queue = new Queue<Omit<CreateVideoData, "id">>(
    process.env.QUEUE_NAME!,
    {
      connection: connection,
    }
  );

  let jobId: string | undefined;

  try {
    const job = await queue.add("video-generation", {
      prompt,
      characterAssets: {
        "Peter Griffin": {
          path: "peter.png",
          width: 400,
          position: "left",
          voice: "tov167aMyQvZpmAokINb",
        },
        "Stewie Griffin": {
          path: "stewie.png",
          width: 300,
          position: "right",
          voice: "gTMcf0Uie51ZnMdkBNYG",
        },
      },
      delay: 0.5,
      backgroundBlur: "high",
    });
    jobId = job.id;
  } catch (error) {
    console.error("Failed to create video:", error);
    return { success: false, error: "Failed to create video" };
  } finally {
    await queue.close();
  }

  if (!jobId) {
    return { success: false, error: "Failed to get job ID" };
  }

  redirect(`/jobs/${jobId}`);
}

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <VideoForm createVideo={createVideo} />
      </main>
    </div>
  );
}
