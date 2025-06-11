import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { queue } from "@acme/db/queue";

import { protectedProcedure } from "../trpc";

export const dashboardRouter = {
  createVideo: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
        preset: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { prompt } = input;

      const job = await queue.add(
        prompt,
        {
          prompt,
          userId: ctx.session.user.id,
          characterAssets: {},
          delay: 0.5,
          backgroundBlur: "high",
        },
        {
          jobId: crypto.randomUUID(),
        },
      );

      return {
        jobId: job.id,
      };
    }),
} satisfies TRPCRouterRecord;
