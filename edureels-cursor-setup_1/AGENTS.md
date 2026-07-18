# AGENTS.md — EduReels (AI Educational Video Platform)

You are an agent working on EduReels: a React Native (web-first) + NestJS + Supabase
app that generates personalized educational videos (Remotion + ElevenLabs).
Team of 3, hackathon MVP. Local + EC2 only. Only paid API: ElevenLabs (100k credits).

## Golden rules (never skip)
1. Every feature starts from a spec in `/specs/<feature>.md`. If none exists, CREATE IT FIRST.
2. Never merge a PR. Open it and stop — humans approve.
3. Never call ElevenLabs in tests or dev loops. Use `/backend/fixtures/tts/*.mp3`. TTS is cached by hash(text+voice) — check cache before any real call.
4. No new paid services, SDKs requiring API keys, or cloud dependencies. Ask if unsure.
5. All FE code must compile for react-native-web AND native. No web-only APIs (document, window) outside `*.web.tsx` files.

## Workflow: feature request → PR
Execute stages in order. Each stage names its skill and its skip condition.

### Stage 1 — SPEC (skill: spec-generation)
- Input: feature request text.
- Output: `/specs/<feature>.md` containing:
  - Scope + out-of-scope
  - API contract (endpoints, DTOs, status codes) — FROZEN after this stage
  - DB delta (Supabase migration sketch)
  - UI states (loading/empty/error/success)
  - **Parallelization verdict**: `PARALLEL` (contract is standard CRUD/known shape)
    or `BE_FIRST` (contract uncertain: new pipeline, streaming, auth flows)
  - Skill plan: which of stages 2–6 apply
- SKIP: never. Even one-line fixes get a 5-line spec.

### Stage 2 — DESIGN (skill: ui-design-conversion)
- Convert the provided Replit/React prototype into an RN-compatible component
  breakdown (NativeWind classes, navigation placement, catalogue multi-select).
- SKIP IF: backend-only feature, OR feature reuses existing screens unchanged.

### Stage 3 — BACKEND (skill: backend-development)
- NestJS module under `/backend/src/modules/<domain>`.
- Follow `.cursor/rules/nestjs-backend.mdc`.
- Definition of done: endpoints match spec contract exactly; migration applied;
  module boots; `curl` smoke test in PR description.
- SKIP IF: pure UI change with no data needs.

### Stage 4 — FRONTEND (skill: frontend-development)
- RN + TypeScript screens under `/app`. Follow `.cursor/rules/react-native-frontend.mdc`.
- If spec says PARALLEL: build against `/app/src/api/mocks/` generated from the
  spec contract; swap to real client in Stage 5.
- SKIP IF: backend-only feature.

### Stage 5 — INTEGRATE
- Replace mocks with real API client. One commit, no logic changes.
- SKIP IF: stages 3 or 4 were skipped.

### Stage 6 — VERIFY (skill: playwright-sanity-verification; tool: Playwright MCP)
- Run web build, then Playwright MCP sanity flow:
  1. Sign up → 2. Complete profile (age group + multi-select topics/interests)
  3. Land on profile page, analytics widgets render
  4. Trigger video generation (FIXTURE audio) → player plays, scenes advance
  5. Watch-time event recorded → analytics number changes
- On failure: apply debugging-and-error-recovery, fix, re-run. Max 3 loops, then
  report blockers instead of thrashing.
- SKIP: never for features touching UI. For pure-backend, replace with e2e curl tests.

### Stage 7 — REVIEW (skill: review-and-ship §Stage 7)
- security-and-hardening ONLY when the diff touches: auth, env/keys, file upload,
  SQL/query building. Otherwise skip it (credit conservation).

### Stage 8 — SHIP (skill: review-and-ship §Stage 8)
- Branch `feat/<feature>`, conventional commits, push, open PR with:
  spec link, screenshots/recording, Playwright result, run commands.
- STOP. Do not merge.

## Skill skip-decision table (fast path)
| Task smell | Skills to run | Skills to skip |
|---|---|---|
| "Fix typo/copy/style" | git-workflow | everything else (mini-spec inline in PR) |
| "New screen, existing API" | spec, design, FE, verify, review, ship | BE, integrate |
| "New endpoint, no UI" | spec, BE, verify(curl), review, ship | design, FE |
| "Full feature" | all stages | none |
| "Video pipeline change" | spec (BE_FIRST!), BE, FE, verify, review+security, ship | design (player exists) |

## Rapid parallel development & merge conflicts
Three members work simultaneously on different features. Conflicts are expected;
handle them by protocol, not improvisation.

### Prevention (cheaper than resolution)
1. **Ownership map** — each branch edits ONLY its owned paths:
   - A: `/specs`, `backend/src/modules/{auth,users,catalogue,analytics}`
   - B: `/app` (all frontend)
   - C: `backend/src/modules/generation`, `remotion/`, `app/src/features/player`
   Shared files (`package.json`, app router, backend `app.module.ts`, spec files)
   are APPEND-ONLY hotspots: add your line, never reorder or reformat others' lines.
2. **Rebase cadence**: before starting ANY task and before opening a PR, run
   `git fetch && git rebase origin/main`. Small, frequent syncs = trivial conflicts.
3. **Merge cadence**: PRs merge to main as soon as green — do not batch. Long-lived
   branches are the #1 conflict source. Target PR size: one stage, < ~400 lines.
4. **Contract freeze**: `/specs/*.md`, shared DTO/type files, and the VideoTimeline
   schema change only via a spec-update commit announced to the team. Never edit
   them incidentally inside a feature branch.
5. No formatter wars: prettier config is committed; never run repo-wide reformatting
   inside a feature branch.

### Resolution (skill: merge-conflict-resolution — see .cursor/skills/)
When a rebase/merge conflicts, invoke the merge-conflict-resolution skill. Summary:
classify (ownership violation / lockfile / generated / contract / ordinary) →
merge INTENT for ordinary source → regenerate lockfiles & generated files →
NEVER auto-resolve contract files (escalate to human) → verify with build + tests +
marker grep before continuing. Two failed attempts = stop and ask a human.

## Bundled skills (.cursor/skills/) — this repo is self-contained
| Skill | Stage | Invoke when |
|---|---|---|
| spec-generation | 1 | Any new feature request |
| ui-design-conversion | 2 | Prototype provided / new screen |
| backend-development | 3 | Data or pipeline work |
| frontend-development | 4 | UI work |
| playwright-sanity-verification | 6 | After integration, before review |
| review-and-ship | 7-8 | Branch complete and verified |
| merge-conflict-resolution | any | Rebase/merge conflict, or before starting work |
Optional extra: `npx skills add addyosmani/agent-skills` adds general-purpose skills
(test-driven-development, performance-optimization, etc.) — useful, not required.

## Context discipline
- Read only: the spec, the rule file for your layer, and files you will edit.
- Do not load the whole repo. Do not re-read node_modules or generated Remotion output.
- Each Cursor agent tab owns ONE stage. Hand off via the spec file + git branch,
  never via chat history.

## Credit conservation ($30/member)
- Prefer Auto/fast models for boilerplate (DTOs, styles, mocks); reserve heavy models
  for spec, pipeline logic, and debugging loops.
- Never let an agent "explore the codebase" open-endedly; give file paths.
- Reuse the spec as the single prompt-context artifact instead of long chat threads.

## Run commands (must appear in every PR description)
- Web: `npm run web` → http://localhost:8081 (Expo web)
- iOS simulator: `npm run ios` (requires Xcode; web is the demo priority)
- Backend: `cd backend && npm run start:dev` (NestJS :3000)
- Full stack: `npm run dev` (concurrently: backend + expo web)
