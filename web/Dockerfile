# syntax=docker/dockerfile:1
#
# Targets:
#   dev    — next dev (hot reload). Default for docker-compose.
#   runner — production standalone (npm run build). Use: docker compose build --target runner

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Hot-reload development (default compose target) ---
FROM node:22-bookworm-slim AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
# File watching through Docker Desktop / bind mounts (macOS)
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3001
# node_modules may come from a named volume — install if missing, then dev server
CMD ["sh", "-c", "if [ ! -x node_modules/.bin/next ]; then npm ci; fi && exec npm run dev"]

# --- Production build ---
FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_BASE=http://localhost:3000
ARG NEXT_PUBLIC_AUTH_DEV_BYPASS=false

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_AUTH_DEV_BYPASS=$NEXT_PUBLIC_AUTH_DEV_BYPASS
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_BASE=http://localhost:3000
ARG NEXT_PUBLIC_AUTH_DEV_BYPASS=false
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_AUTH_DEV_BYPASS=$NEXT_PUBLIC_AUTH_DEV_BYPASS

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3001
CMD ["node", "server.js"]
