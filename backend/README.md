# EduReels API (NestJS)

Serves the Next.js web app under `/web` (port 3001).

## Run

```bash
cd backend
cp ../docker-compose.env.example .env   # fill Supabase values as needed
# Local demo without JWT:
# AUTH_DEV_BYPASS=true
npm run start:dev
```

Health: `GET http://localhost:3000/health`

## Smoke (dev bypass)

```bash
AUTH_DEV_BYPASS=true npm run start:dev
# other terminal, from repo root:
AUTH_DEV_BYPASS=true npm run sanity:onboarding
```

## Key routes

- `POST /api/v1/auth/bootstrap`
- `GET /api/v1/catalogue`
- `PUT /api/v1/profiles/onboarding`
- `POST /api/v1/videos`
