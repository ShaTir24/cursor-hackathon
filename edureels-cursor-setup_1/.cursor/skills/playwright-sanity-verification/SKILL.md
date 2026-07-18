---
name: playwright-sanity-verification
description: Run the canonical end-to-end sanity flow with Playwright MCP against the local web build. Stage 6 of the workflow. Use after integration, before review. Includes a bounded debug loop for failures.
---

# Playwright Sanity Verification (Stage 6)

## Preconditions
- `npm run dev` running (backend :3000, Expo web :8081); seeded catalogue data;
  NODE_ENV uses TTS fixtures (zero ElevenLabs credits during verification).

## Canonical flow (assert every step via testIDs / data-testid)
1. Open /sign-up → register fresh user (timestamp email) → redirected to profile setup
2. Select age group + ≥2 topics + ≥2 interests via chips → save → profile page loads
3. Assert widgets render: total-time, topic-time, peak-hours, most-watched
   (empty states acceptable for a fresh user — assert the empty state, not blank space)
4. Generate video: pick topic + interest → submit → poll UI until player visible
   (timeout 60s)
5. Assert audio playing and scene index increments at least once
6. Wait ≥12s of playback → back to profile → assert total-time increased
7. Sign out → sign in with same creds → profile persists

For backend-only features: replace with a curl/supertest sequence covering the
changed endpoints + one regression call per neighboring endpoint.

## Failure protocol (bounded — protects Cursor credits)
On any step failure:
1. Capture screenshot + browser console + the failing network request via MCP.
2. Diagnose: FE issue (render/state), BE issue (status code/shape), or contract
   mismatch (FE expectation ≠ BE response → the spec is the referee; whichever side
   deviates from the spec is the bug).
3. Fix in the owning module only. Re-run FROM STEP 1 (full flow, not just the failed step).
4. Max 3 fix-and-rerun loops. Then STOP and write a blocker report:
   failing step, evidence, hypothesis, attempted fixes. Hand to a human.

## Output
Append to PR description: pass/fail per step, total runtime, screenshots of
profile page and player. A PR without this block does not proceed to Stage 7.
