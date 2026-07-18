---
name: frontend-development
description: Implement React Native (web-first) features from the spec + design doc. Stage 4 of the workflow. Builds against mocks when the spec says PARALLEL. Works with .cursor/rules/react-native-frontend.mdc.
---

# Frontend Development (Stage 4)

## Order of work (vertical slices, not layers)
1. Generate/extend `src/api/mocks/<domain>.ts` from the spec's frozen contract —
   same function signatures the real client will have.
2. Build ONE screen end-to-end (layout → state → mock data → all 4 UI states) and
   verify it renders on web before starting the next screen.
3. Add testIDs from the spec as you build — never retrofit them in Stage 6.
4. Repeat per screen. Commit per screen, not per feature.

## Implementation rules
- Server state via TanStack Query hooks in `src/features/<name>/hooks.ts`;
  components stay declarative. Local UI state via useState/Zustand only.
- The mock/real switch is ONE import in `src/api/index.ts` driven by
  `EXPO_PUBLIC_USE_MOCKS`. Integration (Stage 5) = flip the flag, fix diffs, one commit.
- Forms: controlled inputs + inline validation mirroring backend DTO rules, so
  the same errors appear client-side before the API is even wired.
- Watch-time heartbeat: a `useWatchHeartbeat(videoId, topicId)` hook posts every 10s
  while playback status is playing; pauses stop the timer. This feeds ALL analytics.
- Player: consume VideoTimeline JSON; `expo-av` Audio per scene; advance scene on
  `didJustFinish`; show scene visual + onScreenText; progress bar = elapsed/total durationMs.

## Definition of done (per screen)
- `tsc --noEmit` clean; renders on `npm run web`; all 4 states reachable
  (force via mock flags); testIDs present; no console errors.
