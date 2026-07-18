# EduReels backend (onboarding slice)

## Run
```bash
cd backend && npm install && npm run start:dev
```
Listens on `http://localhost:3000` with global prefix `/api/v1`.

## Auth (MVP)
`Authorization: Bearer <userId>` — stand-in until Supabase JWT verification lands.
Catalogue routes are `@Public()`.

## Smoke
```bash
curl -s http://localhost:3000/api/v1/catalogue | head
curl -s -X PUT http://localhost:3000/api/v1/users/me/profile \
  -H 'Authorization: Bearer demo-user' \
  -H 'Content-Type: application/json' \
  -d '{"persona":"student","ageGroupId":"ages_5_10","topicIds":["topic_math"],"themeIds":["theme_pokemon"]}'
```
