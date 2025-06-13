# VidGen

AI-generated short form content.

## Tech Stack

0. [T3](https://create.t3.gg)
1. [AI SDK](https://ai-sdk.dev) for script generation
2. [Remotion](https://remotion.dev)
3. [ElevenLabs](https://elevenlabs.io/)
4. [UploadThing](https://uploadthing.com)
5. [BullMQ](https://bullmq.io)

## Project structure

These are the _important_ parts of the codebase:

```json
  apps
    nextjs // front end dashboard w/ better-auth (github)
    worker // the code responsible for video gen
  packages
    db // has schema, BullMQ types
```

Keep in mind that you do not need to run the Next.js app to generate videos. `apps/worker` uses [BullMQ](https://docs.bullmq.io/) as a Redis-backed Queue for jobs, so you can create an instance and push jobs to it anywhere/way you want.

## Getting started

### Local development

This project uses [Infisical](https://infisical.com) as a secrets manager. You can either install the CLI and set up your project on their dashboard, or use `dotenv`. Either way, see `.env.example` for the variables you need to provide.

If you have `pnpm` installed, install the dependencies with:

`pnpm install`

And develop with

`pnpm dev`

### Setting up a `Preset`

A `Preset` is a combination of `Character`s with a background video and other parameters. When combined with a string prompt, the `Worker` is able to generate a short-form video autonomously.

You can run the following to get a quick UI for Postgres to add `Character`s and create your first `Preset`:

`pnpm db:push` (propegate the schema to Postgres)

`pnpm db:studio` (run the UI on [local.drizzle.studio](https://local.drizzle.studio))

_Note that a preset **must** have at least 2 `Character`s with exactly 1 `Character` with a `role` of `teacher`._

## Deploying

### Worker

_Local generation is **strongly** reccommended for performance unless you can deploy to a VPS with GPU access._

There is a `Dockerfile` in the root that builds an optimized image of the worker for maximum portability across environments, which is important because Remotion requires many OS-level dependencies to work.

### Website

The website, on the other hand, is a standard Next.js app and can be deployed without much additional afterthought. [Vercel](https://vercel.com) is a good place to start.

## Contributions

This is the product of a sprint by [smrth](https://smrth.dev). Contributions are fine, but it isn't my focus going forward!
