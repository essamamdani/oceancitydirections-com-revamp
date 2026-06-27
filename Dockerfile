FROM oven/bun:alpine AS base
RUN apk add --no-cache libc6-compat

# Stage 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun update caniuse-lite
RUN bun run build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
# sharp is a native addon — Next.js file tracing misses it, copy manually
COPY --from=deps /app/node_modules/sharp ./node_modules/sharp

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["bun", "run", "server.js"]