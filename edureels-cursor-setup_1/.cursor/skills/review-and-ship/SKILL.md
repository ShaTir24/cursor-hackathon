---
name: review-and-ship
description: Final review pass then branch/commit/push/open PR for human approval. Stages 7-8 of the workflow. Never merges.
---

# Review & Ship (Stages 7-8)

## Stage 7 — Review (on the full branch diff)
Five-axis pass, hackathon-calibrated (flag blockers, don't gold-plate):
1. **Correctness** — logic matches spec; edge cases in the spec's UI states covered.
2. **Contract fidelity** — endpoints/DTOs/testIDs match the spec verbatim; any drift is
   a blocker (it breaks teammates), fix code not spec.
3. **Security (conditional)** — ONLY if diff touches auth, env/keys, uploads, or query
   building: check for secrets in code, user id from body instead of JWT, unparameterized
   SQL, ElevenLabs calls outside TtsService. Otherwise skip to save credits.
4. **Simplification** — delete dead code, unused imports, commented-out blocks,
   console.logs. Do NOT restructure working code this late.
5. **Ownership** — diff stays inside the branch's owned paths (AGENTS.md map);
   out-of-scope files are reverted unless spec-sanctioned.

## Stage 8 — Ship
1. `git fetch && git rebase origin/main` (invoke merge-conflict-resolution skill if needed).
2. Conventional commits: `feat(profile): topic-wise watch time widget`. Squash fixups.
3. Push `feat/<feature>` with `--force-with-lease` if rebased.
4. Open PR (`gh pr create`) with template:
   - Spec link, summary
   - Playwright/curl verification block (from Stage 6)
   - Screenshots or screen recording
   - Run commands: `npm run dev` (web demo), `npm run ios` (simulator)
   - Conscious deviations from spec, if any, with rationale
5. **STOP. Never merge.** Notify the merge marshal. After human merge, all members
   rebase before their next commit.
