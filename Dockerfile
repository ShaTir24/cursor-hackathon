# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY backend/package*.json ./
# Peer ranges mix Nest 10/11; local installs use --legacy-peer-deps
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
COPY backend/ ./
RUN npm run build && npm prune --omit=dev --legacy-peer-deps

ENV NODE_ENV=production
ENV HLS_ROOT=/data/hls
ENV TTS_CACHE_DIR=/data/tts-cache
ENV PORT=3000
ENV FFMPEG_PATH=ffmpeg

RUN mkdir -p /data/hls /data/tts-cache
VOLUME ["/data"]

EXPOSE 3000
CMD ["node", "dist/main.js"]
