/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
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
        },
        {
          jobId: crypto.randomUUID(),
        },
      );

      return {
        jobId: job.id,
      };
    }),
  getVideo: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { jobId } = input;
      const job = await queue.getJob(jobId);

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const { progress, state } = job.progress as {
        progress: number;
        state: string;
      };

      if (!state) {
        return {
          id: job.id,
          state: "Waiting for server",
          progress: 0,
          url: null,
          title: null,
          description: null,
        };
      }

      return {
        id: job.id,
        state,
        progress,
        url: job.returnvalue?.url,
        title: job.returnvalue?.title,
        description: job.returnvalue?.description,
      };
    }),
} satisfies TRPCRouterRecord;
