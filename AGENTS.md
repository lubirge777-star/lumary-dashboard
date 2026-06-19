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
- Chatwoot: `lubirge@lumary.com` / `Lumary2026!`
- Proxy (`src/proxy.ts`) protects all dashboard routes

## Data Layer
- **PostgreSQL connected** — `usePrisma = true` ✅
- Shared DB with stack: `localhost:5432/lumi_crm`, user `postgres`, password `P0stgr3s_2026`
- Tables: User, Client, Project, Payment, Expense, Retainer, Message, Activity, Integration, QuickReply, WebhookLog, AutomationRule, AISuggestion
- Seeded: 1 user, 35 clients, 50 projects, 50 payments, 18 expenses, 7 retainers, 85 messages, 55 activities, 22 AI suggestions, 7 automation rules, 8 quick replies, 3 integrations

## Integrated Stack (`lumi-crm-stack`)
| Service | Port | Status |
|---------|------|--------|
| PostgreSQL (pgvector) | 5432 | ✅ Running |
| Redis | — | ✅ Running |
| Evolution API | 8080 | ✅ Running (instance: lumary_business, connected) |
| Chatwoot | 3003 | ✅ Running (admin: lubirge@lumary.com / Lumary2026!) |
| Typebot Builder | 8081 | ✅ Running |
| Typebot Viewer | 8082 | ✅ Running |
| Dashboard | 3000 | ✅ Running |

## Database Fix (2026-06-19)
All 8 custom PostgreSQL ENUM types migrated to `text` columns to resolve `PrismaClientKnownRequestError` with `@prisma/adapter-pg` v7.8.0 adapter. ENUMs dropped after migration.

## API Keys (in .env + docker-compose)
- **Evolution API**: `429683C4C977415CAAFCCE10F7D57E11` ✅
- **Chatwoot**: `j3fXvL8RemHgsenabEHhwpP1` ✅
- **Typebot**: `tb_apikey_lumary_2026` ✅

## Autonomous Features (NEW)

### AI Service (`src/lib/ai.ts`)
- **Intent Detection**: Pattern-matches incoming WhatsApp messages → detects `quote_request`, `status_check`, `complaint`, `payment_question`, `greeting`, etc.
- **Suggested Replies**: Auto-generates Swahili/English context-aware responses per intent
- **Quote Generator**: Recommends pricing based on service type + description complexity
- **Weekly Digest**: Aggregates active/stalled projects, pending invoices, new clients, recommendations
- **Churn Detection**: Flags clients at risk (long inactivity, never paid, dormant)
- **Suggested Actions**: Context-aware next steps per intent

### WhatsApp Outbound (`src/lib/whatsapp.ts`)
- `sendWhatsApp(to, message)` — sends text via Evolution API
- `sendMediaWhatsApp(to, caption, mediaUrl, mediaType)` — sends images/documents

### Automation Engine (`src/lib/automation.ts`)
- **Rule evaluation**: `evaluateRules(trigger, payload)` — checks active rules, evaluates conditions, executes actions
- **Conditions**: field.equals, field.contains, field.gt, field.lt, field.not_empty
- **Actions**: SEND_WHATSAPP, UPDATE_PROJECT_STATUS, CREATE_ACTIVITY, CREATE_REMINDER
- **Self-registering**: Webhook evolution route now calls `evaluateRules("message_received", payload)` on each inbound msg

### API Routes (new)
| Route | Method | Description |
|-------|--------|-------------|
| `/api/v1/messages/send` | POST | Send WhatsApp message via Evolution API |
| `/api/v1/automation-rules` | GET/POST/PATCH/DELETE | CRUD for automation rules |
| `/api/v1/ai/suggest` | POST | Analyze message, generate quote, suggest actions |
| `/api/v1/ai/digest` | GET | Weekly business digest with recommendations |
| `/api/v1/inbox` | GET | Unified inbox grouped by client |

## Pages (39 total)
### Business CRM
- `/` — Overview (KPIs, revenue chart, activity feed)
- `/clients` — Client management table + add/edit/detail modals
- `/projects` — Kanban pipeline with drag-and-drop
- `/messages` — WhatsApp-style chat with AI reply suggestions
- `/retainers` — Retainer management with alerts
- `/finance` — P&L, payments, expenses
- `/analytics` — Charts (bar, pie, trend)
- `/calendar` — Appointment calendar
- `/content` — Content calendar with platform priority
- `/pricing` — Quoting engine with pricing tables
- `/wedge` — Product idea problem log
- `/templates` — Swahili quick-reply templates
- `/automation` — Visual automation rules builder
- `/operations` — Weekly routine with daily schedule
- `/learning` — Learning progress with skill tracks

### Personal Command Center (v7 merge)
- `/habits` — 10 daily habits with week overview + streak
- `/timer` — Pomodoro timer with session logging
- `/journal` — Learning journal with categories + export
- `/goals` — Goal cascade (Dream→10yr→Year→Q→Month→Week→Today)
- `/arabic` — 7-step Arabic learning path + speaking timer
- `/grades` — DIT course grades with GPA predictor
- `/reading` — Book tracker with reading sessions
- `/movies` — MCU (99 films) + Date Night (51 films) tracker
- `/resources` — 15 curated free learning resources

### Growth & Learning
- `/roadmap` — 6-phase full-stack developer roadmap (44 tasks)
- `/figma-path` — 8-stage Figma learning path
- `/skill-radar` — Rate 14 skills 1-10 with save
- `/trajectory` — 10-year career trajectory milestones
- `/heatmap` — GitHub-style habit contribution heatmap
- `/focus` — Focus analytics with weekly/monthly charts

### Ventures
- `/ideas` — Idea Validator (Mom Test method)
- `/portfolio` — Project portfolio with status tracking
- `/saas-bank` — Micro-SaaS idea bank
- `/network` — Networking CRM with contacts
- `/conbridge` — Construction skill→Product bridge
- `/accountability` — Commitment tracker with due dates
- `/weekly-review` — Weekly review with ratings + history

### System
- `/settings` — Pricing, Quick Replies, Integrations
- `/login` — Login page
- `/portal/[clientId]` — Client portal

## AI Copilot Widget
- Floating button (bottom-right) with `Bot` icon
- Panel shows: active/stalled project summary, pending invoices, new clients, top recommendations
- Auto-refreshes every 60s

## Webhooks (all active)
- Evolution API → `POST /api/v1/webhooks/evolution` (persists + triggers automation)
- Chatwoot → `POST /api/v1/webhooks/chatwoot`
- Typebot → `POST /api/v1/webhooks/typebot`
- Events log → `GET /api/v1/webhooks/events`

## What's Complete
- ✅ M3 light theme on all pages + modals
- ✅ All store consumers migrated to React Query
- ✅ PostgreSQL live with seed data + new AutomationRule/AISuggestion tables
- ✅ Webhook routes persist messages & activities to DB + trigger automation
- ✅ WhatsApp outbound messaging via Evolution API
- ✅ AI intent detection + suggested replies + quote generation
- ✅ Weekly business digest with recommendations
- ✅ Automation rules engine (trigger → conditions → actions)
- ✅ Visual automation rule builder UI
- ✅ Unified inbox API (all channels grouped per client)
- ✅ AI copilot floating widget
- ✅ All 3 integrations connected (Evolution, Chatwoot, Typebot)
- ✅ Build passes (all pages 200)
