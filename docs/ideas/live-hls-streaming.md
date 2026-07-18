# Live Progressive HLS Streaming

## Problem Statement
How might we deliver personalized educational video that starts playing within ~one scene of generation starting, using standard HLS (M3U8), without waiting for a full Remotion render?

## Recommended Direction
Progressive **EVENT** HLS with full A/V: each scene’s slideshow frame is muxed with ElevenLabs MP3 into MPEG-TS segments and appended to a growing playlist. The player attaches on `202` using `hlsUrl`. When all scenes finish, write `#EXT-X-ENDLIST` and mark the video `ready`. Remotion remains an offline “Export MP4” path only.

## Key Assumptions to Validate
- [ ] Judges accept slideshow visuals as “video” if the stream feels continuous — demo with 5-scene fixture pack.
- [ ] One-scene buffer (~4–8s) avoids stall if TTS for N+1 overlaps encode of N — measure first-byte latency with fixtures.
- [ ] Render $100 covers a demo weekend with one small instance + ffmpeg spikes — monitor dashboard.

## MVP Scope
- Scene-ordered TTS → ffmpeg pack → EVENT playlist → web HLS player
- Optional Exa research once per generate
- Docker/Render hosting with ffmpeg + `/data/hls`
- Fixtures + TTS cache + daily budget guard

## Not Doing (and Why)
- True LL-HLS / CMAF — overkill for hackathon latency goals
- Multi-bitrate ABR ladders — single quality is enough for demo
- Flow voice dictation — does not help TTS→HLS
- Manim / avatar — unreliable or paid latency
- S3 / CloudFront — Render disk + static routes suffice
- Remotion on the live hot path — Chrome-headless kills first-byte latency

## Open Questions
- None blocking; contract frozen in `specs/live-hls-streaming.md`.
