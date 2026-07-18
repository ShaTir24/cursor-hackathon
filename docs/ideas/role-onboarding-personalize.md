# Role Onboarding + Personalized Generation

## Problem Statement
How Might We let a new user pick student or teacher, complete a profile, and immediately get personalized learning media — students get interest-themed topic videos; teachers get a class video plus a short lesson pack?

## Recommended Direction
Full Supabase Auth + profiles. Student onboarding: age group + ≥2 topics + ≥2 interests. Teacher onboarding: subjects + grade bands. Generate reuses the progressive HLS pipeline; teachers also receive a JSON lesson pack (objectives, talking points, 3 quiz items).

## Key Assumptions to Validate
- [ ] Judges accept template lesson packs (no extra LLM) as teacher value
- [ ] Supabase free tier covers demo weekend
- [ ] Students generate from first selected topic × first interest by default

## MVP Scope
- Signup/signin, role picker, role-specific onboarding, catalogue chips
- Profile-driven `POST /videos` + HLS player on 202
- Teacher `includeLessonPack: true` → `lesson_packs` row
- JWT auth on Nest; RLS on profiles/videos/lesson_packs

## Not Doing (and Why)
- Class roster / misconception heatmap — out of hackathon time
- Flow voice dictation — not needed for TTS→HLS
- ABR / Remotion on hot path — already decided for live HLS
