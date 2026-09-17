# LifeOS — Your Whole Life, One OS

LifeOS is a personal operating system for managing everyday life: tasks, calendar, notes, goals, money, home, travel, family, health, learning, vehicles, and more — plus an AI assistant that reads your real data to help plan your day.

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**,
**MongoDB**, **BetterAuth**, and **OpenAI**. Works instantly in **demo mode**
(no database or API keys required); connect MongoDB + auth keys when ready for production.

## Features

23 modules, grouped in the sidebar:

## Daily

| Module | Route | What it does |
| --- | --- | --- |
| Overview | `/dashboard` | Greeting, AI daily brief, needs-attention list, today's agenda (events + appointments), focus tasks, goal momentum, live per-module counts |
| Tasks | `/dashboard/tasks` | Status (todo / in-progress / done), priority, due dates, tags |
| Calendar | `/dashboard/calendar` | Month view, agenda, color-coded events, all-day support |
| Notes | `/dashboard/notes` | Fast capture with pinning, tags, search |
| Goals | `/dashboard/goals` | Progress %, milestones, target dates, active / completed / paused |
| AI Assistant | `/dashboard/assistant` | Chat grounded in live LifeOS data (see [AI](#ai-assistant)) |

## Life Manager

| Module | Route | What it does |
| --- | --- | --- |
| Reminders | `/dashboard/reminders` | Date/time reminders with daily / weekly / monthly repeat, overdue tracking |
| Work & Projects | `/dashboard/projects` | Project statuses, deadlines, subtasks |
| Home | `/dashboard/home` | Chores & maintenance with area, frequency, cost |
| Travel | `/dashboard/travel` | Trips with dates, budget, status pipeline, packing checklist |
| Finance | `/dashboard/finance` | Income / expense transactions, categories, spending breakdown, balance |
| Shopping | `/dashboard/shopping` | Lists with quantities, recurring items, bought state |
| Family | `/dashboard/family` | Members, duties, priorities, due dates |

## Vault & Insights

| Module | Route | What it does |
| --- | --- | --- |
| Accounts | `/dashboard/vault` | Account metadata + password **hints only** — real passwords are never stored |
| Documents | `/dashboard/documents` | Important documents with storage location and expiry alerts |
| Analytics | `/dashboard/analytics` | Task completion rate, 14-day activity, spending by category, per-module counts |

## Growth

| Module | Route | What it does |
| --- | --- | --- |
| Study | `/dashboard/study` | Subjects, session types, focus minutes, exam prep |
| Knowledge | `/dashboard/knowledge` | Second brain: categorized entries, tags, favorites, full search |

## Garage

| Module | Route | What it does |
| --- | --- | --- |
| Vehicle | `/dashboard/vehicle` | Vehicles (make / model / plate / mileage / fuel) + service reminders with due date / mileage / cost |

## Care & Plans

| Module | Route | What it does |
| --- | --- | --- |
| Appointments | `/dashboard/appointments` | Doctor / dentist / meeting bookings with person, location, missed detection |
| Important Dates | `/dashboard/dates` | Birthdays, anniversaries, holidays with yearly-repeat countdowns |
| Emergency | `/dashboard/emergency` | Tap-to-call emergency contacts + medical & safety notes |
| Who · When · Where | `/dashboard/movements` | Family movements: who goes where, planned / out / back flow |

## Platform

- Light / dark mode toggle (persisted, OS-aware default, no flash on load) — sidebar, homepage, login, signup
- Session-aware homepage navbar (avatar + name + sign out when signed in)
- Responsive layout: horizontal scrollable nav on mobile, sticky vertical sidebar on desktop
- `react-icons` throughout — no emoji icons

## Tech Stack
  
| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.3.5 (App Router) |
| UI | React 19, Tailwind CSS v4 (class-based dark mode), react-icons |
| Database | MongoDB (`mongodb` driver); in-memory fallback in demo mode |
| Auth | BetterAuth (email + password, optional Google OAuth) |
| AI | OpenAI API (`gpt-4o-mini` default, configurable), rule-based demo replies without a key |
| Validation | Zod |
| Fonts | Geist via `next/font` |

## Getting Started

Prerequisites: **Node.js 20+** and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (demo mode — works with zero config)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo mode vs production mode

- **Without `MONGODB_URI`**: the app runs fully usable in demo mode using an in-memory store (per server instance) and a built-in demo user. Auth pages explain the demo path.
- **With `MONGODB_URI` (+ auth secret)**: real MongoDB persistence with per-user data isolation and real BetterAuth sessions.

### Environment variables

Copy the keys below into `.env.local` (all optional — each unlocks a layer):

| Variable | Required for | Default |
|  ---  |  ---  |  ---  |
| `MONGODB_URI` | Real database persistence | _(unset → demo mode)_ |
| `MONGODB_DB` | Database name | `lifeos` |
| `BETTER_AUTH_SECRET` | Signing auth sessions (set a long random string in prod!) | `lifeos-dev-secret-change-me` |
| `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` | Auth callback base URL | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in button | _(unset → hidden)_ |
| `OPENAI_API_KEY` | Live AI reasoning (without it, the assistant uses local demo replies) | _(unset → demo replies)_ |
| `OPENAI_BASE_URL` | OpenAI-compatible endpoint override | _(unset)_ |
| `OPENAI_MODEL` | Chat model | `gpt-4o-mini` |

```bash
# minimal production example
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/lifeos
BETTER_AUTH_SECRET=<long-random-string>
OPENAI_API_KEY=sk-...
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build (type-check + static generation) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
app/
  page.tsx                    # Marketing homepage (module showcase, session-aware nav)
  login/  signup/             # Auth pages (email/password + Google + demo path)
  globals.css                 # Tailwind v4 + class-based dark variant + theme polish
  layout.tsx                  # Fonts, theme init script, ThemeProvider
  dashboard/
    page.tsx                  # Overview: brief, attention, agenda, stats, modules
    layout.tsx                # Sidebar + content shell
    tasks/ calendar/ notes/ goals/ assistant/
    reminders/ projects/ home/ travel/ finance/ shopping/ family/
    vault/ documents/ analytics/
    study/ knowledge/ vehicle/
    appointments/ dates/ emergency/ movements/
  api/
    [...resource]/route.ts + [...resource]/[id]/route.ts
                              # Generic CRUD (GET/POST, PATCH/DELETE) per collection
    dashboard/route.ts        # Aggregated overview signals (attention, counts, finance)
    analytics/route.ts        # Completion, activity, spending, counts
    assistant/route.ts        # Builds live context + calls the AI runner
    auth/[...all]/route.ts    # BetterAuth handler
components/
  Sidebar.tsx                 # Grouped nav with react-icons + theme toggle + sign out
  theme.tsx                   # ThemeProvider, useTheme, ThemeToggle, init script
  ui.tsx                      # Shared Card, PageHeader, Btn, Input, Textarea,
                              # Select, Badge, Empty
  HomeAuth.tsx                # Session-aware homepage navbar actions
lib/
  db.ts                       # COLLECTIONS registry + MongoDB / in-memory store
  crud.ts                     # collectionRoutes() / itemRoutes() factories
  types.ts                    # All entity interfaces
  auth.ts / auth-client.ts / session.ts  # Server auth, client auth, current-user helper
  mongodb.ts                  # Connection + isDbConfigured()
  ai.ts                       # System prompt, live-context block, demo replies
```

## API Reference

Every collection follows the same REST shape (all routes require auth):

```
GET    /api/<resource>        # list current user's items (max 500)
POST   /api/<resource>        # create (validates required fields)
PATCH  /api/<resource>/<id>   # update allowed fields only
DELETE /api/<resource>/<id>   # delete
```

Resources: `tasks`, `events`, `notes`, `goals`, `reminders`, `projects`, `home`, `trips`, `finance`, `vault`, `shopping`, `documents`, `family`, `study`, `knowledge`, `vehicles`, `vehicle-services`, `appointments`, `important-dates`, `emergency-contacts`, `emergency-info`, `movements`.

Special routes:

```
GET    /api/dashboard         # overview: stats, agenda, attention, finance, moduleCounts
GET    /api/analytics         # productivity, completion rate, spending, counts
POST   /api/assistant         # { messages } → { reply, demo }
```

To add a new module: add the interface to `lib/types.ts`, register the collection in `lib/db.ts`, create the two route files with `collectionRoutes` / `itemRoutes`, add a dashboard page, then wire sidebar + homepage + analytics.

## Auth

- Email + password via BetterAuth with MongoDB adapter (verification off by default).
- Optional Google OAuth — appears automatically when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set.
- Sessions last 7 days. Server code resolves the user with `getCurrentUser()` (demo user in demo mode); client code uses `authClient.useSession()`.
- All API routes and dashboard data are scoped per `userId`.

## AI Assistant

`POST /api/assistant` gathers live slices from 19 collections (tasks, events, goals, notes, reminders, projects, home, trips, finance, shopping, family, documents, study, knowledge, vehicle services, appointments, important dates, emergency contacts, movements) and injects them into the model context.

- The system prompt (`lib/ai.ts`) documents every module, its routes and fields, plus rules: ground answers in live data, never invent, respect urgency/countdowns, no medical or regulated financial advice, route new items to the right module.
- Privacy by design: the Accounts vault and medical details are **excluded** from AI context.
- Without `OPENAI_API_KEY`, the assistant answers with local rule-based demo replies and the UI shows a “demo mode” badge.

## Theming

Dark mode is class-based (`@custom-variant` in `globals.css`): a `beforeInteractive` script reads `localStorage` (falling back to `prefers-color-scheme`) and sets `.dark` pre-paint, so there's no flash.
`ThemeProvider` keeps React state in sync, including across tabs via the `storage` event.

## Deployment

The easiest target is [Vercel](https://vercel.com/new): import the repo, add the [environment variables](#environment-variables) above, and deploy. Any Node.js host works too:

```bash
npm run build
npm run start   # serves on $PORT ?: 3000
```

For production, always set `MONGODB_URI` and a strong BETTER_AUTH_SECRET`.

## Privacy & Safety Notes

- The vault stores account metadata and personal **hints only** — never real passwords.
- Emergency data is a family reference, not a substitute for professional help; the emergency page says so, and the AI refuses medical diagnosis.
- In demo mode data lives in server memory and resets on restart.

## Contributing

Issues and PRs are welcome. Please run `npm run lint` and `npx tsc --noEmit` before submitting, and keep new modules consistent with the existing
`lib/types.ts` → `lib/db.ts` → `app/api/*` → `app/dashboard/*` → sidebar → homepage → analytics pattern.
