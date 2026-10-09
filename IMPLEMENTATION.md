# Implementation status

The original static prototype is preserved in `dist/`. The current application is a local Next.js application in `src/`. The previous Sites URL serves the prototype; the new local PostgreSQL and Ollama services are not available to that Cloudflare-hosted static deployment.

## Architecture

- Next.js App Router server layouts enforce sign-in. Client components handle interactive screens.
- Custom email/password authentication uses salted scrypt hashes, opaque random session cookies, HMAC-hashed session IDs, a 30-day expiry, HTTP-only cookies, and same-site/origin checks. No external identity provider is required for local use.
- PostgreSQL and Prisma store normalized, user-owned records. Database migrations include uniqueness and numeric constraints. Mutations validate with Zod and check ownership; task/calendar scheduling serializes saves per user to check conflicts.
- `src/lib/metrics.ts` calculates dates, recurrence, streaks, milestone progress, weekly task completions, and financial totals. Financial records store integer minor units.
- `src/lib/ai/` holds the server-side Groq adapter and loopback Ollama client, context, validated output schemas, and restricted actions. Proposals are saved in conversation messages. Applying a proposal is atomic, checks ownership and conflicts, and cannot be repeated.
- Journal text is excluded from AI context unless the user explicitly checks the consent box for a request. All personal data is isolated by authenticated user.
- The local database directory and model files live under `%LOCALAPPDATA%/AuraAI`, outside OneDrive. Local configuration is ignored by Git.

## Remaining operational limits

- Local-first release: no cloud synchronization, bank connection, external calendar integration, password reset email, or OAuth.
- AI answers return as one validated response rather than token streaming. This prevents an incomplete action payload from being presented as executable.
- Task recurrence supports daily, weekly, and monthly repetition; completing an occurrence creates the next pending occurrence. Scheduled tasks must finish on the same date. Calendar events use date + local wall-clock times rather than cross-day instants.
- Habit streaks are consecutive calendar days, separately from configurable weekly targets.
- Focus timer is transient UI state, not a stored productivity metric.
- Task completion charts count currently completed tasks by their latest completion date. Reopening a task removes it from that completion chart.
- In-process rate limits suit one local instance; a distributed deployment needs a shared rate-limit store, HTTPS, backups, and deployment-specific hardening.
- Data in PostgreSQL is private through authentication and ownership checks; disk encryption depends on the operating system.
- Existing browser-only prototype records are not automatically imported because those records include unlabeled demo entries. The new account begins empty.

## Hosted AI provider

`src/lib/ai/provider.ts` chooses Groq or Ollama from server environment configuration. Groq uses a fixed HTTPS endpoint, bearer authentication, best-effort JSON schema output, and independent Zod validation. Provider responses never directly mutate records. Missing credentials and quota errors are sanitized. Hosted status checks send no workspace data. Journal text remains opt-in. API keys never appear in workspace responses or browser settings. Hosted model selection comes from `GROQ_MODEL`, keeping legacy local model preferences from selecting an invalid hosted model. There is no automatic fallback that silently sends local requests to a hosted provider.
