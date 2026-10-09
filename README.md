# Synora — Your AI-powered Personal Life OS

A local personal workspace built with Next.js, React, strict TypeScript, Tailwind, Lucide, Recharts, PostgreSQL, Prisma, Zod, and server-side AI providers. The original static prototype is preserved in `dist/`.

## Run locally

The app is at **http://localhost:3000**. Create your own account on the sign-in screen. New accounts start with no demo records.

On this Windows checkout, restart the installed local services with:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-local.ps1
```

For a fresh checkout (Node 20.9+):

```powershell
npm install
npm run setup
npm run db:generate
npm run db:start
```

Leave PostgreSQL running; in a second terminal:

```powershell
npm run db:migrate
npm run dev
```

`setup` generates a local ignored `.env` with a random database password and authentication secret. The bundled PostgreSQL helper runs real PostgreSQL on loopback port 5433; it stores files in `%LOCALAPPDATA%/AuraAI/postgres`, not the OneDrive checkout. Alternatively configure `DATABASE_URL` for your own PostgreSQL instance and skip `db:start`.

## Hosted AI (recommended: Groq)

Create a key at [Groq Console](https://console.groq.com/keys). Edit the ignored local `.env` file, then restart the app:

```dotenv
AI_PROVIDER=groq
GROQ_API_KEY=your_actual_key
GROQ_MODEL=openai/gpt-oss-120b
```

Never paste the key into chat or use a `NEXT_PUBLIC_` variable. Groq receives relevant tasks, events, goals, habit and finance summaries when you request an AI response or briefing. Journal content is excluded unless explicitly selected for that request. Changes remain validated proposals until confirmed. Check the connection in Settings. A missing key, unavailable provider, or quota limit leaves the other features working; briefings fall back to a labeled saved-data summary.

This checkout now uses Groq. The former downloaded local model has been removed and the startup script no longer starts Ollama. New setups also default to Groq. The hosted model is selected through `GROQ_MODEL`; the account model preference applies only to Ollama.

## Environment

See `.env.example`:

- `DATABASE_URL`: PostgreSQL connection URL.
- `AUTH_SECRET`: random secret, at least 32 characters.
- `APP_ORIGIN`: canonical browser origin, locally `http://localhost:3000`.
- `AI_PROVIDER`: `groq` or `ollama`.
- `GROQ_API_KEY`: server-only hosted credential.
- `GROQ_MODEL`: hosted model, default `openai/gpt-oss-120b` (must support JSON schema output).
- `OLLAMA_BASE_URL`: defaults to `http://127.0.0.1:11434`; restricted to loopback.
- `OLLAMA_MODEL`: intended default `qwen3:4b`. Account model preferences can be changed in Settings.
- `DATABASE_DIR`: persistent directory for the optional local database helper.

## Features

- My Day: actual saved activity, three focus priorities, upcoming commitments, goals, habits, weekly chart, daily briefing, and focus timer.
- Tasks: create/edit/delete, descriptions, tags, categories, priorities, statuses, search/filter/sort, start/due dates, estimates, recurring occurrences, scheduling, list/board views.
- Calendar: day/week/month, saved tasks and events, all-day entries, editing/rescheduling, conflict warnings and explicit override in manual forms.
- Assistant: Groq or local Ollama chat, stored conversations, suggested prompts, retries, private journal opt-in, validated action previews, confirmation, and atomic execution.
- Goals and habits: milestones, linked tasks, manual or milestone progress, target dates, completion dates, archive/restore, weekly check-ins, real streaks and rates.
- Journal: private Markdown entries, optional moods, tags, search, timeline, edit/delete, weekly reflection prompts.
- Finance: manual income/expenses, categories, date and currency filters, monthly budgets, savings goals, actual totals and charts. Money uses integer minor units.
- Insights and settings: real date-labeled metrics, profile, timezone, currency, week start, themes, in-app reminders, model status, data export, account deletion.

## Checks and production build

PostgreSQL must be running for integration tests; AI providers are mocked in automated tests. The app must be running on port 3000 for Playwright.

```powershell
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run test:ai
npm run build
npm start
```

E2E and integration tests create dedicated test accounts and remove only those accounts afterward. `test:ai` is a separate live AI smoke check, requiring the configured provider and credentials or installed local model. Actual results are recorded in [VERIFICATION.md](VERIFICATION.md).

## Optional demo account

No seed data is inserted automatically. To create a separate, clearly labeled demo account, set `DEMO_PASSWORD` to a unique password with at least 10 characters, optionally set `DEMO_EMAIL`, then run:

```powershell
npm run db:seed -- --demo
```

The seed refuses to overwrite an existing account.

## Troubleshooting

- Database unavailable: start `npm run db:start`; inspect `.runtime/database-error.log`. Never delete the persistent data directory to fix a connection problem.
- Port 3000 already used: stop your own other server or use `npx next dev --port 3001`, updating `APP_ORIGIN` to match.
- AI offline/model missing: check Settings; start Ollama and pull the account’s selected model. Allow time for the first model load.
- A calendar save warns about overlap: choose another time or explicitly check the manual overlap override. AI proposals block conflicts instead of overriding them.
- The previous hosted Sites URL still shows the prototype: this release uses local PostgreSQL and server-side AI and runs on localhost. See [implementation notes](IMPLEMENTATION.md) for limitations and architecture.
