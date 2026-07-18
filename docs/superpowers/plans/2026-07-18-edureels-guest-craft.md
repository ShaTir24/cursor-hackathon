# EduReels Guest-First Product Craft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Guest-first EduReels Next app: brand entry at `/`, Learn/Teach flows without login, forest-green editorial craft + GSAP, shadcn/ReUI patterns.

**Architecture:** Remove `(app)` session gate; API uses `AUTH_DEV_BYPASS` + `x-user-id` guest UUID from localStorage; brand entry → role → onboarding → home → player.

**Tech Stack:** Next 15, shadcn (Sidebar), free ReUI registry where useful, GSAP + `@gsap/react`, Nest JWT bypass.

---

### Task 1: Branch hygiene

**Files:** none (git)

- [x] Checkout `cursor/edureels-web-frontend`; confirm `web/src` exists

### Task 2: Design system + logo

**Files:**
- Modify: `web/design-system/MASTER.md`
- Modify: `web/src/app/globals.css`
- Create: `web/src/components/brand/edu-reels-logo.tsx`
- Modify: `web/src/app/layout.tsx` (metadata only if needed)

### Task 3: Guest auth

**Files:**
- Create: `web/src/lib/guest.ts`
- Modify: `web/src/lib/api.ts`
- Modify: `web/src/app/(app)/layout.tsx`
- Modify: `docker-compose.env.example`, `docker-compose.yml`

### Task 4: Registry + shell

**Files:**
- Modify: `web/components.json` (ReUI registry)
- Modify: `web/src/components/layout/app-shell.tsx`
- Add gsap deps in `web/package.json`

### Task 5–9: Surfaces

**Files:** root page, role, onboarding, homes, player, login demotion, WEB_SMOKE

### Task 10: Verify

- [ ] `npm run build` in `web/`
- [ ] Update `e2e/WEB_SMOKE.md` for guest path
