---
name: spec-generation
description: Turn a feature request into /specs/<feature>.md with a frozen API contract, DB delta, UI states, parallelization verdict, and skill plan. Use FIRST for every feature. This is Stage 1 of the AGENTS.md workflow.
---

# Spec Generation (Stage 1)

## Output: `/specs/<feature>.md` with EXACTLY these sections
1. **Goal** — one paragraph, user-visible outcome.
2. **Out of scope** — explicit exclusions (prevents agent scope creep).
3. **API contract (FROZEN)** — every endpoint:
   `METHOD /api/v1/path` | request DTO (field: type, validation) | response shape | error codes.
   This section is the handoff artifact: FE mocks and BE controllers are BOTH generated from it verbatim.
4. **DB delta** — new/altered tables and columns, referencing existing schema
   (users, profiles, catalogue_topics, catalogue_interests, videos, video_scenes, watch_events).
5. **UI states** — per screen: loading / empty / error / success, plus testIDs for Playwright.
6. **Parallelization verdict** — `PARALLEL` or `BE_FIRST` with one-line reason.
   BE_FIRST when: contract shape is uncertain, new pipeline/streaming behavior, auth changes.
   PARALLEL for: standard CRUD, screens over known data.
7. **Skill plan** — checklist of stages 2-8 with run/skip and reason.
8. **Estimate** — per-stage minutes; flag anything > 90 min as needing a scope cut.

## Rules
- Interrogate the request first: if age group, catalogue values, or analytics definitions
  are ambiguous, ask up to 3 pointed questions BEFORE writing. Otherwise state assumptions
  in a visible `Assumptions:` block.
- Contracts reuse existing DTO conventions; never invent a second error shape.
- Keep the whole spec under 120 lines. A spec nobody reads is a spec nobody follows.
- Commit the spec to main directly (specs are the one thing that bypasses feature branches)
  so all three members immediately see it after their next rebase.
