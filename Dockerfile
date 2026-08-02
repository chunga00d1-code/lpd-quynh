# Step 1: Build stage
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy package management files only first to leverage Docker layer cache
COPY package.json package-lock.json ./

# NODE_ENV must NOT be "production" here so devDependencies (vinext, vite,
# wrangler, typescript...) needed for the build are installed
ENV NODE_ENV=development
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy the rest of the workspace (see .dockerignore for exclusions)
COPY . .

# Show Node.js/npm versions for debugging
RUN node --version && npm --version

# vinext build produces the Worker-shaped artifact at dist/server/index.js
# Increase Node.js heap size to avoid OOM errors on large bundles
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npx vinext build
RUN test -f dist/server/index.js

# Step 2: Production runner stage
FROM node:22-bookworm-slim AS runner

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates tzdata \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# vinext start needs the full node_modules (it runs the built Worker through
# its own local runtime, which itself depends on the wrangler/workerd
# toolchain declared as devDependencies) — unlike a plain bundled Node
# server, we cannot prune to production-only deps here.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node_modules/.bin/vinext", "start", "--port", "3000"]
