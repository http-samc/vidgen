# Base stage for building
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate

# Copy everything
COPY . .

# Generate pruned monorepo
RUN pnpm dlx turbo prune @acme/worker --docker

# Runner stage
FROM node:22-bookworm-slim AS runner

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
  libnss3 \
  libdbus-1-3 \
  libatk1.0-0 \
  libgbm-dev \
  libasound2 \
  libxrandr2 \
  libxkbcommon-dev \
  libxfixes3 \
  libxcomposite1 \
  libxdamage1 \
  libatk-bridge2.0-0 \
  libpango-1.0-0 \
  libcairo2 \
  libcups2

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.11.1 --activate

# Prepare pnpm
ENV SHELL=/bin/bash
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
RUN pnpm setup

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm build

# Install remotion and tsx
RUN pnpm add -g tsx
RUN pnpm add -g remotion

# Preinstall remotion browser
RUN pnpm exec remotion browser ensure

# Create output directory for videos
RUN mkdir -p /app/out

# Start the application
CMD ["sh", "-c", "cd apps/worker && pnpm start"]