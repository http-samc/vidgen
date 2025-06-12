/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { eq } from "@acme/db";
import { db } from "@acme/db/client";
import { queue } from "@acme/db/queue";
import { preset, video } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

export const dashboardRouter = {
  createVideo: protectedProcedure
    .input(
      z.object({
        prompt: z.string(),
        preset: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userPreset = await db.query.preset.findFirst({
        where: eq(preset.name, input.preset),
        with: {
          characters: {
            with: {
              character: true,
            },
          },
        },
      });

      if (!userPreset) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const job = await queue.add(
        input.prompt,
        {
          prompt: input.prompt,
          userId: ctx.session.user.id,
          characterAssets: Object.fromEntries(
            userPreset.characters.map(({ character }) => [
              character.name,
              {
                path: character.imageUrl,
                width: character.width,
                position: character.position,
                voice: character.voiceId,
              },
            ]),
          ),
          delay: userPreset.delay,
          backgroundBlur: userPreset.backgroundBlur,
          backgroundVideo: userPreset.backgroundVideo,
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

      const isCompleted = await job.isCompleted();

      if (isCompleted) {
        const completedVideo = await db.query.video.findFirst({
          where: eq(video.id, jobId),
        });

        return {
          id: job.id,
          state: "Completed",
          progress: 100,
          url: completedVideo?.url,
          title: completedVideo?.title,
          description: completedVideo?.description,
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
  getVideos: protectedProcedure.query(async ({ ctx }) => {
    const videos = await db.query.video.findMany({
      where: eq(video.userId, ctx.session.user.id),
    });

    return videos;
  }),
  getPresets: protectedProcedure.query(async () => {
    const presets = await db.query.preset.findMany();

    return presets.map(({ id, name }) => ({ id, value: name }));
  }),
} satisfies TRPCRouterRecord;
