# EduReels backend (onboarding slice)

## Run
```bash
cd backend && npm install && npm run start:dev
```
Listens on `http://localhost:3000` with global prefix `/api/v1`.

## Auth (MVP)
`Authorization: Bearer <userId>` — stand-in until Supabase JWT verification lands.
Catalogue routes are `@Public()`.

## Supabase
Copy `.env.example` → `.env` and set:
- `SUPABASE_URL` (e.g. `https://ihbfdnajyiqouobjwtbp.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` (Dashboard → API; server-only)

Apply schema: `migrations/002_profiles_supabase.sql` (also applied via Supabase MCP).
Without env vars, profiles fall back to in-memory (unit tests).

## Smoke
```bash
curl -s http://localhost:3000/api/v1/catalogue | head
curl -s -X PUT http://localhost:3000/api/v1/users/me/profile \
  -H 'Authorization: Bearer demo-user' \
  -H 'Content-Type: application/json' \
  -d '{"persona":"student","ageGroupId":"ages_5_10","topicIds":["topic_math"],"themeIds":["theme_pokemon"],"uiTheme":"lagoon"}'
curl -s -X PATCH http://localhost:3000/api/v1/users/me/profile/theme \
  -H 'Authorization: Bearer demo-user' \
  -H 'Content-Type: application/json' \
  -d '{"uiTheme":"ink"}'
```
