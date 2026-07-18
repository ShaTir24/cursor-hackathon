# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    ca-certificates \
    bash \
    tar \
    gzip \
  && rm -rf /var/lib/apt/lists/*

# Cursor Agent CLI (headless) — required for video generation agents on Render
# Auth at runtime via CURSOR_API_KEY (set in Render Dashboard, never bake into image)
RUN curl https://cursor.com/install -fsS | bash \
  && ln -sf /root/.local/bin/agent /usr/local/bin/agent \
  && ln -sf /root/.local/bin/cursor-agent /usr/local/bin/cursor-agent \
  && agent --version

ENV PATH="/root/.local/bin:/usr/local/bin:${PATH}"

WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
# Install ALL deps (incl. TypeScript) before compile. Peer ranges mix Nest 10/11.
RUN npm ci --legacy-peer-deps
COPY backend/ ./
RUN npm run build \
  && npm prune --omit=dev --legacy-peer-deps

ENV NODE_ENV=production
ENV HLS_ROOT=/data/hls
ENV TTS_CACHE_DIR=/data/tts-cache
ENV PORT=3000
ENV FFMPEG_PATH=ffmpeg

RUN mkdir -p /data/hls /data/tts-cache
VOLUME ["/data"]

EXPOSE 3000
CMD ["node", "dist/main.js"]
