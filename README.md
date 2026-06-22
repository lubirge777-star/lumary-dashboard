# LUMARY Dashboard

All-in-one CRM, business management, and personal command center for LUMARY — a digital agency serving Swahili-speaking SMEs. Built to replace spreadsheets, siloed tools, and manual workflows with a unified platform.

## Overview

LUMARY Dashboard combines agency CRM (clients, projects, payments, retainers, pipeline), WhatsApp-based customer communication with AI-assisted replies, a visual automation engine, finance tracking, and a personal command center (habits, goals, journal, Pomodoro, learning, grades, reading, movies) — all under one roof.

**39 pages** across Business CRM, Personal Command Center, Growth & Learning, Ventures, and System modules.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, standalone output) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4, Material 3 light theme |
| **Database** | PostgreSQL 16 (via Docker) |
| **ORM** | [Prisma](https://www.prisma.io/) v7 (`@prisma/client` + `@prisma/adapter-pg`) |
| **Auth** | [NextAuth v5 beta](https://next-auth.js.org/) (Credentials provider) |
| **State / Data Fetching** | [TanStack React Query](https://tanstack.com/query) v5 |
| **Forms** | React Hook Form + Zod |
| **Charts** | Recharts |
| **Drag & Drop** | dnd-kit |
| **AI** | Google Generative AI (Gemini) + pattern-matching intent engine |
| **Icons** | Lucide React, Material Symbols |
| **Fonts** | Plus Jakarta Sans, Inter, JetBrains Mono |
| **Testing** | Vitest + Testing Library + jsdom |
| **Linting** | ESLint 9 + Prettier |
| **Package Manager** | pnpm |
| **Containerization** | Docker + Docker Compose |

### Integrated Services (lumi-crm-stack)

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL (pgvector) | 5432 | Primary database |
| Evolution API | 8080 | WhatsApp Business API gateway |
| Chatwoot | 3003 | Multi-channel customer support |
| Typebot Builder | 8081 | Chatbot builder |
| Typebot Viewer | 8082 | Chatbot viewer |
| Redis | — | Caching / queue |

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 9+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL and integrated services)
- Git

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url> lumary-dashboard
cd lumary-dashboard

# 2. Install dependencies
pnpm install

# 3. Create environment file
cp .env.example .env
# Edit .env — set DATABASE_URL and AUTH_SECRET (see Environment Variables below)

# 4. Start PostgreSQL via Docker
pnpm db:up

# 5. Run Prisma migrations
pnpm prisma:migrate

# 6. Seed the database
npx tsx prisma/seed.ts

# 7. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — login with `lubirge@lumary.com` / `lumary2026`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Generate Prisma client + build Next.js |
| `pnpm start` | Start production server |
| `pnpm test` | Run tests (Vitest) |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm lint` | Lint with ESLint |
| `pnpm prisma:generate` | Regenerate Prisma client |
| `pnpm prisma:migrate` | Run Prisma dev migrations |
| `pnpm prisma:studio` | Open Prisma Studio |
| `pnpm db:up` | Start PostgreSQL container |
| `pnpm db:down` | Stop PostgreSQL container |
| `pnpm db:reset` | Reset DB (destroy volumes, recreate, migrate) |
| `pnpm docker:build` | Build Docker image for the app |
| `pnpm docker:up` | Start all Docker services (app + Postgres) |
| `pnpm docker:down` | Stop all Docker services |

## Docker Deployment

The project ships with a multi-stage Dockerfile and docker-compose.yml for production.

```bash
# Build and start both Postgres and the app
pnpm docker:build
pnpm docker:up

# Or use docker-compose directly
docker compose up -d
```

The app runs on **port 3000** with `standalone` output mode and includes security headers (CSP, X-Frame-Options, etc.) out of the box.

## Authentication

NextAuth v5 beta with a credentials provider. The proxy middleware (`src/proxy.ts`) protects all dashboard routes.

**Default credentials:** `lubirge@lumary.com` / `lumary2026`

All `/api/v1/*` routes require authentication via `require-auth.ts`.

## API Routes

All API routes live under `/api/v1/`:

### Core CRM
| Route | Method(s) | Description |
|-------|-----------|-------------|
| `/api/v1/clients` | GET, POST | List / create clients |
| `/api/v1/clients/[id]` | GET, PATCH, DELETE | Single client CRUD |
| `/api/v1/projects` | GET, POST | List / create projects |
| `/api/v1/pipeline` | GET, POST | Pipeline / Kanban operations |
| `/api/v1/projects/[id]/steps` | GET, POST | Per-project pipeline steps |
| `/api/v1/projects/checkup` | GET, POST | Project checkup questions |
| `/api/v1/payments` | GET, POST | List / create payments |
| `/api/v1/payments/[id]` | GET, PATCH | Single payment |
| `/api/v1/expenses` | GET, POST | List / create expenses |
| `/api/v1/retainers` | GET, POST | Retainer management |
| `/api/v1/finance` | GET | P&L overview |
| `/api/v1/finance/income` | GET, POST | Income logs |
| `/api/v1/integrations` | GET, POST, PATCH | Integration status / config |
| `/api/v1/services/pricing` | GET, POST, PATCH | Service pricing |
| `/api/v1/settings` | GET, PATCH | App settings |
| `/api/v1/users` | GET, POST | User management |

### Messaging & Webhooks
| Route | Method(s) | Description |
|-------|-----------|-------------|
| `/api/v1/messages/send` | POST | Send WhatsApp message via Baileys bridge |
| `/api/v1/inbox` | GET | Unified inbox (all channels, grouped by client) |
| `/api/v1/templates` | GET, POST | Quick-reply templates |
| `/api/v1/webhooks/events` | GET | Webhook event log |
| `/api/v1/whatsapp/qr` | GET | WhatsApp QR code for pairing |
| `/api/v1/whatsapp/status` | GET | WhatsApp connection status |
| `/api/v1/whatsapp/sync` | POST | Force WhatsApp sync |
| `/api/v1/whatsapp/disconnect` | POST | Disconnect WhatsApp |

### AI & Automation
| Route | Method(s) | Description |
|-------|-----------|-------------|
| `/api/v1/ai/suggest` | POST | Intent detection, quote generation, suggested actions |
| `/api/v1/ai/digest` | GET | Weekly business digest with recommendations |
| `/api/v1/automation-rules` | GET, POST, PATCH, DELETE | CRUD for automation rules |

### Personal Command Center
| Route | Method(s) | Description |
|-------|-----------|-------------|
| `/api/v1/habits` | GET, POST | Habit definitions |
| `/api/v1/habit-logs` | GET, POST | Daily habit tracking |
| `/api/v1/timer-sessions` | GET, POST | Pomodoro session logs |
| `/api/v1/journal-entries` | GET, POST | Learning journal |
| `/api/v1/goals` | GET, POST, PATCH | Goal cascade |
| `/api/v1/goals/seed` | POST | Seed default goals |
| `/api/v1/arabic-sessions` | GET, POST | Arabic study sessions |
| `/api/v1/grades` | GET, POST, PATCH | DIT course grades |
| `/api/v1/books` | GET, POST | Book tracker |
| `/api/v1/reading-sessions` | GET, POST | Reading session logs |
| `/api/v1/movies` | GET, POST | Movie / MCU tracker |
| `/api/v1/resources` | GET | Learning resources |
| `/api/v1/appointments` | GET, POST | Calendar appointments |
| `/api/v1/appointments/[id]` | GET, PATCH, DELETE | Single appointment |

### Growth & Ventures
| Route | Method(s) | Description |
|-------|-----------|-------------|
| `/api/v1/skill-ratings` | GET, POST | Skill radar ratings |
| `/api/v1/trajectory-milestones` | GET, POST | Career trajectory |
| `/api/v1/milestones` | GET, POST | Growth milestones |
| `/api/v1/learning` | GET, POST | Learning progress |
| `/api/v1/ideas` | GET, POST | Idea validator |
| `/api/v1/portfolio-projects` | GET, POST | Portfolio projects |
| `/api/v1/saas-ideas` | GET, POST | Micro-SaaS idea bank |
| `/api/v1/contacts` | GET, POST | Networking CRM |
| `/api/v1/commitments` | GET, POST | Accountability tracker |
| `/api/v1/weekly-reviews` | GET, POST | Weekly reviews |
| `/api/v1/referrals` | GET, POST | Client referral tracking |
| `/api/v1/transition` | GET, POST | Product transition tracking |
| `/api/v1/wedge` | GET, POST | Product idea problem log |
| `/api/v1/social/posts` | GET, POST | Social media posts |
| `/api/v1/social/analytics` | GET | Social analytics |
| `/api/v1/social/collabs` | GET, POST | Social collaborations |
| `/api/v1/content-calendar` | GET, POST | Content calendar |
| `/api/v1/routine` | GET, POST | Routine slots |
| `/api/v1/routine/log` | GET, POST | Routine daily logs |
| `/api/v1/routine/status` | GET | Routine completion status |

### System
| Route | Method(s) | Description |
|-------|-----------|-------------|
| `/api/v1/checklists` | GET, POST | Checklist items |
| `/api/v1/checklists/complete` | POST | Mark checklist complete |
| `/api/v1/custom-pages` | GET, POST | Custom dashboard pages |
| `/api/v1/export/[type]` | GET | Data export |
| `/api/v1/reminders` | GET, POST | System reminders |
| `/api/v1/user-config` | GET, PATCH | User configuration |
| `/api/v1/diag` | GET | Diagnostic endpoint |
| `/api/v1/mcp` | POST | MCP API (optional key-protected) |
| `/api/v1/hermes` | POST | Hermes messaging endpoint |
| `/api/v1/today/briefing` | GET | Daily briefing data |

### Auth
| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | All | NextAuth handlers (sign in, sign out, session, callbacks) |

### Client Portal
| Route | Method | Description |
|-------|--------|-------------|
| `/api/v1/portal/login` | POST | Client portal login |
| `/api/v1/portal/[clientId]` | GET | Client portal data |

## Pages

### Business CRM (15)
| Route | Description |
|-------|-------------|
| `/` | Overview dashboard — KPIs, revenue chart, activity feed |
| `/clients` | Client management — table + add/edit/detail modals |
| `/clients/[id]` | Client detail view |
| `/projects` | Kanban pipeline with drag-and-drop |
| `/messages` | WhatsApp-style chat with AI reply suggestions |
| `/retainers` | Retainer management with alerts |
| `/finance` | P&L, payments, expenses |
| `/analytics` | Charts (bar, pie, trend) |
| `/calendar` | Appointment calendar |
| `/content` | Content calendar with platform priority |
| `/pricing` | Quoting engine with pricing tables |
| `/wedge` | Product idea problem log |
| `/templates` | Swahili quick-reply templates |
| `/automation` | Visual automation rules builder |
| `/operations` | Weekly routine with daily schedule |
| `/learning` | Learning progress with skill tracks |

### Personal Command Center (10)
| Route | Description |
|-------|-------------|
| `/habits` | 10 daily habits with week overview + streak |
| `/timer` | Pomodoro timer with session logging |
| `/journal` | Learning journal with categories + export |
| `/goals` | Goal cascade (Dream → 10yr → Year → Q → Month → Week → Today) |
| `/arabic` | 7-step Arabic learning path + speaking timer |
| `/grades` | DIT course grades with GPA predictor |
| `/reading` | Book tracker with reading sessions |
| `/movies` | MCU (99 films) + Date Night (51 films) tracker |
| `/resources` | 15 curated free learning resources |

### Growth & Learning (6)
| Route | Description |
|-------|-------------|
| `/roadmap` | 6-phase full-stack developer roadmap (44 tasks) |
| `/figma-path` | 8-stage Figma learning path |
| `/skill-radar` | Rate 14 skills 1–10 with save |
| `/trajectory` | 10-year career trajectory milestones |
| `/heatmap` | GitHub-style habit contribution heatmap |
| `/focus` | Focus analytics with weekly/monthly charts |

### Ventures (7)
| Route | Description |
|-------|-------------|
| `/ideas` | Idea Validator (Mom Test method) |
| `/portfolio` | Project portfolio with status tracking |
| `/saas-bank` | Micro-SaaS idea bank |
| `/network` | Networking CRM with contacts |
| `/conbridge` | Construction skill → Product bridge |
| `/accountability` | Commitment tracker with due dates |
| `/weekly-review` | Weekly review with ratings + history |
| `/referrals` | Referral tracking |
| `/checklists` | Checklists for processes |
| `/transition` | Product transition roadmap |
| `/social` | Social media management |
| `/timetable` | Timetable view |

### System (3)
| Route | Description |
|-------|-------------|
| `/settings` | Pricing, Quick Replies, Integrations |
| `/login` | Login page |
| `/portal/[clientId]` | Client portal |

## Design System

Material 3 light theme with glass-morphism cards:

| Token | Value |
|-------|-------|
| Background | `#fff8f6` |
| Primary | `#9d4319` |
| Secondary | `#00629f` |
| Tertiary | `#7e35ca` |
| Error | `#ba1a1a` |
| Glass cards | White bg, 24px `backdrop-blur`, `rounded-3xl` |
| Gradients | `grad-orange`, `grad-blue`, `grad-purple`, `grad-green` |

## Database Schema

33 models managed via Prisma:

- **Core CRM**: User, Client, Project, Payment, Expense, Retainer, Message, Activity, Appointment, Integration, QuickReply, WebhookLog, AutomationRule
- **Business Spec**: ServicePricing, PipelineStep, IncomeLog, WedgeLog, LearningProgress, ContentCalendar, GrowthMilestone, ProjectCheckup, WhatsAppSync, Reminder, CustomPage
- **Personal Command Center**: ArabicSession, Grade, Habit, HabitLog, TimerSession, JournalEntry, Book, ReadingSession, Goal, Idea, Contact, Commitment, SaasIdea, WeeklyReview, PortfolioProject, SkillRating, TrajectoryMilestone, Movie, UserConfig
- **Business Spec v2**: RoutineSlot, RoutineLog, SocialMediaPost, SocialMediaCollab, ChecklistItem, ChecklistCompletion, Referral, ProductTransition

## AI Features

- **Intent Detection**: Pattern-matches incoming WhatsApp messages to detect quote requests, status checks, complaints, payment questions, greetings, and more
- **Suggested Replies**: Auto-generates Swahili/English context-aware responses per intent
- **Quote Generator**: Recommends pricing based on service type and description complexity
- **Weekly Digest**: Aggregates active/stalled projects, pending invoices, new clients, and recommendations
- **Churn Detection**: Flags clients at risk (long inactivity, never paid, dormant)
- **Automation Engine**: Evaluate rules on triggers (message received, etc.) → conditions (field.equals, field.contains, etc.) → actions (SEND_WHATSAPP, UPDATE_PROJECT_STATUS, CREATE_ACTIVITY, CREATE_REMINDER)

## AI Copilot Widget

Floating button (bottom-right) with `Bot` icon. Panel shows: active/stalled project summary, pending invoices, new clients, top recommendations. Auto-refreshes every 60 seconds.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g. `postgresql://postgres:P0stgr3s_2026@localhost:5432/lumi_crm`) |
| `AUTH_SECRET` | Yes | Random 32+ char string for NextAuth JWT encryption (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | Public URL of the app (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | No | Falls back to `AUTH_SECRET` |
| `MCP_API_KEY` | No | Optional key to protect the `/api/v1/mcp` endpoint |
| `DIRECT_DATABASE_URL` | No | Non-pooled DB URL for Prisma migrations |
| `GEMINI_API_KEY` | No | Google Generative AI API key for AI features |

## Project Structure

```
lumary-dashboard/
├── .env.example            # Environment template
├── docker-compose.yml      # PostgreSQL + app services
├── Dockerfile              # Multi-stage production build
├── next.config.ts          # Next.js config (standalone output, CSP headers)
├── vitest.config.ts        # Test configuration
├── prisma/
│   ├── schema.prisma       # Database schema (33 models)
│   └── seed.ts             # Seed script
└── src/
    ├── app/
    │   ├── (dashboard)/    # All protected dashboard pages (50+)
    │   ├── login/          # Login page
    │   ├── portal/         # Client portal pages
    │   └── api/            # API routes (Next.js App Router)
    │       ├── auth/       # NextAuth handlers
    │       └── v1/         # All REST API routes
    ├── lib/
    │   ├── auth.ts         # NextAuth config (credentials provider)
    │   ├── require-auth.ts # API route guard
    │   ├── ai.ts           # AI intent detection, suggestions, digest
    │   ├── automation.ts   # Automation rules engine
    │   ├── whatsapp.ts     # Evolution API WhatsApp client
    │   ├── db.ts           # Prisma client singleton
    │   └── proxy.ts        # Dashboard route protection middleware
    ├── components/         # Shared React components
    ├── hooks/              # Custom React hooks
    └── generated/prisma/   # Auto-generated Prisma client
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `style:` — formatting, missing semicolons, etc.
- `docs:` — documentation only
- `test:` — adding or fixing tests
- `chore:` — build process or tooling changes

### Pre-submit Checklist

- [ ] `pnpm build` passes
- [ ] `pnpm lint` is clean
- [ ] `pnpm test` passes
- [ ] New API routes include proper auth guards (`require-auth.ts`)
- [ ] New pages are added inside the `(dashboard)` route group for automatic auth protection
