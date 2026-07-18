# EduReels Real Auth + Enterprise Login/Signup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore real Supabase email/password Sign in and Sign up as the primary product path with a professional split-panel auth UI; remove guest access.

**Architecture:** Brand entry → `/login` (Sign in | Create account) → bootstrap → role/onboarding → home → player. Nest receives Bearer JWT only (`AUTH_DEV_BYPASS=false`).

**Tech Stack:** Next 15, Supabase Auth PKCE, shadcn Input/Button/Tabs, Zod + RHF, GSAP entrance motion, EduReels forest-green tokens.

---

### Task 1: Kill guest path

- [ ] Bearer-only `api.ts`; session gate in `(app)/layout`; Sign out in shell; Compose bypass false

### Task 2: Auth UI + Supabase wire

- [ ] `auth-form.tsx` + split-panel `login/page.tsx` with signIn/signUp
- [ ] Entry CTAs to `/login`; MASTER + WEB_SMOKE updates

### Task 3: Verify

- [ ] `npm run build` in `web/`; smoke docs login-first
