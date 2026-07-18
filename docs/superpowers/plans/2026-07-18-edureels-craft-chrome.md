# EduReels Enterprise Craft Chrome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enterprise craft redesign of Entry, Shell, Role, Onboarding, Home, and Player while freezing login/signup and API contracts.

**Architecture:** Classroom light-table signature — soft `edu-mesh` atmosphere; reel as hero stage; lesson pack as companion Sheet. shadcn Empty/Item/Field + ReUI Stepper on EduReels tokens (`#0B6E4F`, Fraunces + Source Sans 3).

**Tech Stack:** Next.js App Router, shadcn base-nova (Base UI), ReUI registry `@reui`, GSAP entrances, existing Nest/Supabase APIs unchanged.

---

## Locked freezes

- **Do not edit:** `web/src/components/auth/auth-form.tsx`, `web/src/app/(auth)/login/page.tsx`, `web/src/app/auth/callback/page.tsx`
- **Do not change:** `web/src/lib/api.ts` request/response shapes
- **Reject:** indigo, Baloo/Comic, OLED dark, KPI dashboards, purple AI templates

## Tasks

### Task 1: Plan + design notes
- [ ] Write this plan file
- [ ] Extend `web/design-system/MASTER.md` + `web/design-system/pages/*.md`

### Task 2: Primitives
- [ ] `npx shadcn@latest add empty item field`
- [ ] `npx shadcn@latest add @reui/stepper` (retoken green)

### Task 3: App shell
- [ ] Restructure `app-shell.tsx` — persona badge, nav hierarchy, inset mesh

### Task 4: Entry
- [ ] Elevate `page.tsx` brand hero; keep `entry-signin` / `entry-signup`

### Task 5: Role
- [ ] Equal-weight radio cards; motion-safe

### Task 6: Onboarding
- [ ] Stepper: Name → Catalogue → Review; same `submitOnboarding` payloads

### Task 7: Home
- [ ] Student/Teacher stage + Empty/Item recents; same `createVideo`

### Task 8: Player
- [ ] Cinematic stage + denser lesson pack Sheet

### Task 9: Verify
- [ ] `npm run build`; update `e2e/WEB_SMOKE.md`; confirm auth files untouched

## Preserve testids

`entry-signin`, `entry-signup`, `role-student`, `role-teacher`, `generate-submit`, `lesson-pack-open`, `onboarding-submit`, auth testids (frozen).
