# LUMARY Dashboard — Agent State

## Stack
- Next.js 16 + TypeScript + Tailwind v4 + Prisma v7 + Recharts + @dnd-kit + next-auth v5 beta + @tanstack/react-query + react-hook-form + zod + vitest

## Design
- **Material 3 light theme**: bg `#fff8f6`, primary `#9d4319`, secondary `#00629f`, tertiary `#7e35ca`, error `#ba1a1a`
- Glass cards: white bg, 24px backdrop-blur, 24px/3xl radius
- Gradients: `grad-orange`, `grad-blue`, `grad-purple`, `grad-green`
- Fonts: Plus Jakarta Sans + Inter + JetBrains Mono + Material Symbols

## Auth
- NextAuth v5 beta, credentials provider
- Login: `lubirge@lumary.com` / `lumary2026`
- `AUTH_SECRET` env var required (no hardcoded fallback)

## Deployment
- **Frontend**: Vercel (auto-deploys from git)
- **Database**: Supabase Postgres
- **WhatsApp**: Evolution API credentials stored in Vercel env vars
- **Storage**: Supabase

## Autonomous Features

### AI Service (`src/lib/ai.ts`)
- Intent Detection, Suggested Replies, Quote Generator, Weekly Digest, Churn Detection, Suggested Actions

### WhatsApp Outbound (`src/lib/whatsapp.ts`)
- `sendWhatsApp(to, message)` — sends text via Evolution API
- `sendMediaWhatsApp(to, caption, mediaUrl, mediaType)` — sends images/documents

### Automation Engine (`src/lib/automation.ts`)
- Rule evaluation, Conditions (field.equals, field.contains, field.gt, field.lt, field.not_empty), Actions (SEND_WHATSAPP, UPDATE_PROJECT_STATUS, CREATE_ACTIVITY, CREATE_REMINDER)

### MCP Protocol
- `POST /api/v1/mcp` — LLM function calling endpoint for Hermes AI assistant
- Tools auto-discoverable; adding tools = adding a ToolDef to the appropriate file

## API Routes (75+ endpoints)
- All routes under `/api/v1/` protected with `requireAuth()` guard
- All handlers have try/catch + P2025 (not found) error handling
- POST handlers return 201, pagination clamped with Math.max/min
- Portal, export, webhooks/events have auth protection
- Exceptions: `/api/v1/portal/**`, `/api/v1/mcp`, `/api/v1/hermes`, `/api/v1/webhooks/**` (own auth)

## Pages (50+ routes)
- `/` — Overview KPIs
- `/clients`, `/projects`, `/messages`, `/retainers`, `/finance`, `/analytics`, `/calendar`, `/content`, `/pricing`, `/wedge`, `/templates`, `/automation`, `/operations`, `/learning`
- `/habits`, `/timer`, `/journal`, `/goals`, `/arabic`, `/grades`, `/reading`, `/movies`, `/resources`
- `/roadmap`, `/figma-path`, `/skill-radar`, `/trajectory`, `/heatmap`, `/focus`
- `/ideas`, `/portfolio`, `/saas-bank`, `/network`, `/conbridge`, `/accountability`, `/weekly-review`
- `/settings`, `/login`, `/portal/[clientId]`
- `/timetable`, `/social`, `/checklists`, `/referrals`, `/transition`

## Session Work (2026-06-22)
- **Config/security**: standalone output + CSP in next.config.ts; `.gitignore` fixes; `.env.example` created; docker-compose.yml password mismatch fixed; `AUTH_SECRET` enforcement (throws if missing)
- **Auth**: `src/lib/require-auth.ts` — reusable `requireAuth()` guard returning 401 or null
- **Prisma schema**: 51 models with `@updatedAt`, cascade deletes, FK indexes, unique constraint fixes; datasource url moved to `prisma.config.ts` (Prisma v7)
- **Bug fixes**: `operations/page.tsx` localStorage try/catch; `reading/page.tsx` setTimeout cleanup
- **API routes**: `requireAuth()` on 66 files, 201 codes on 22 POSTs, P2025 handling on 23 files, pagination clamping on 6 handlers
- **README.md**: full setup + deployment + API reference
- **tsconfig**: ES2017 → ES2022
- **Build verified**: `next build` passes, 111 routes compiled

## Prisma Schema
- Output: `src/generated/prisma`
- Custom output path — import from `@/generated/prisma/client`
- All models have `@@index(...)` on FK and filter columns
- `@@unique` on composite keys: Retainer(clientId, currentMonth), Grade(courseCode, semester), HabitLog(habitId, date), RoutineLog(slotId, date), ChecklistCompletion(itemId, completedAt), Referral(clientId, referredPhone), Contact(name, platform), WeeklyReview(weekStart)
