/* eslint-disable turbo/no-undeclared-env-vars */
import { Queue } from "bullmq";
import { connection } from "../../../../lib/bullmq";
import { NextResponse } from "next/server";
import { CreateVideoData } from "@vidgen/worker";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const queue = new Queue<Omit<CreateVideoData, "id">, { url: string }>(
    process.env.QUEUE_NAME!,
    {
      connection: connection,
    }
  );

  try {
    const job = await queue.getJob(id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const state = await job.getState();
    const progress = job.progress as
      | { progress: number; state: string }
      | number;

    return NextResponse.json({
      id: job.id,
      state: typeof progress === "object" ? progress.state : state,
      progress: typeof progress === "object" ? progress.progress : progress,
      url: job.returnvalue?.url,
    });
  } catch (error) {
    console.error("Failed to fetch job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  } finally {
    await queue.close();
  }
}
