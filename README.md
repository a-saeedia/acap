# A|CAP — اولین دستیار هوشمند مدیریت سرمایه در ایران

**Live**: [a-cap.xyz](https://a-cap.xyz)

A|CAP is a full-stack Persian (Farsi) capital management platform combining AI-powered portfolio advisory, real-time Iranian market prices, financial personality profiling, and subscription-based investment signals. Built for the Iranian market with native RTL support, glass-morphism dark UI, and a floating assistant interface.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Data Pipeline](#data-pipeline)
- [AI & ML Systems](#ai--ml-systems)
- [Security](#security)
- [Authentication & Authorization](#authentication--authorization)
- [Performance Optimizations](#performance-optimizations)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Vercel Edge Network                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Landing  │  │  App     │  │  Admin   │  │  API     │   │
│  │  Pages   │  │  Pages   │  │  Panel   │  │  Routes  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │           │        │
│         └──────────────┴──────────────┴───────────┘        │
│                           │                                 │
│                    ┌──────┴──────┐                          │
│                    │  Next.js    │                          │
│                    │  App Router │                          │
│                    └──────┬──────┘                          │
└───────────────────────────┼─────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
    ┌─────┴──────┐   ┌─────┴──────┐   ┌─────┴──────┐
    │ PostgreSQL  │   │  Google    │   │  External  │
    │ (Neon)      │   │  Gemini AI │   │  APIs      │
    │ Drizzle ORM │   │  2.0 Flash │   │  TGJU      │
    └─────────────┘   └────────────┘   │  CoinGecko │
                                        │  TSETMC    │
                                        │  Nobitex   │
                                        └────────────┘
```

### Architecture Highlights

- **Hybrid Rendering**: Static landing pages + client-rendered app dashboard + server-rendered API
- **Edge Caching**: 10-second CDN cache on `/api/prices` with `stale-while-revalidate=30`
- **Parallel Data Fetching**: CoinGecko, TGJU, and TSETMC fetch concurrently — 4s total vs 12s sequential
- **Server Actions**: Mutations use Next.js `'use server'` for zero-client bundle mutations
- **Rate Limiting**: Two-tier — middleware (30 req/min per IP) + AI chat (10 req/min per IP)
- **Cookie-Based Auth**: Better Auth manages sessions with secure, httpOnly cookies

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16.2.6 (App Router) | Full-stack React framework |
| **Language** | TypeScript 5.x | Type safety |
| **Styling** | Tailwind CSS v4 + tw-animate-css | Utility-first RTL styling |
| **UI Library** | shadcn/ui + Base UI + Radix | Headless primitives with custom design |
| **Animation** | Framer Motion 12 | Page transitions, micro-interactions |
| **Icons** | Lucide React | Consistent icon system |
| **Database** | PostgreSQL (Neon Serverless) | Primary data store |
| **ORM** | Drizzle ORM 0.45 | Type-safe queries, migrations |
| **Auth** | Better Auth 1.6 | Email/password auth, session management |
| **AI** | Google Gemini 2.0 Flash | Chat assistant |
| **Email** | Resend | Password reset emails |
| **Deployment** | Vercel (Serverless) | Hosting + CDN |
| **Analytics** | Vercel Analytics | Page views, events |

---

## Features

### User Facing

#### Landing Page (`/`)
- Persian corporate landing with glass-morphism design
- Financial personality quiz (14 questions → 4 investor types)
- Ambassador/referral program with 5 commission tiers
- Founder profiles with biographies
- AI chat bubble (floating, accessible from any page)
- Horizontal price ticker (forex, gold, crypto in IRR)
- Interactive portfolio allocation chart (Canvas-based)

#### Portfolio Dashboard (`/app`)
- **Asset Management**: CRUD for portfolio assets (gold, crypto, currency, stocks, other)
- **Performance Metrics**: Total value, P&L, asset distribution donut chart
- **Portfolio Advisor AI**: Scores portfolio balance 0–100, compares current vs ideal allocation per investor type, provides Persian-language recommendations
- **Deduplication Engine**: Merges duplicate assets by type+symbol on add
- **Onboarding Progress**: Circular widget tracking completion (phone → quiz → profile → assets → subscription)

#### Live Prices (`/app/prices`)
- Real-time prices from TGJU (Iranian market), CoinGecko (crypto), TSETMC (Tehran Stock Exchange)
- Tabbed navigation: همه / ارز دیجیتال / طلا و سکه / ارز
- Persian-labeled floating glass bubble cards
- Animated spinner loading states
- Persian number formatting for all values

#### Investment Signals (`/app/signals`)
- Two-tab view: **A|CAP Revenue** (platform signals) + **شخصی** (admin suggestions)
- Calendar-grid card layout grouped by Persian month
- Key stats: average return, success rate, signal count
- Color-coded profit indicators (emerald/green for positive, red for negative)
- Detail modal per signal: expected vs actual profit, expiration status, investor type, description
- Time range filters: 1m / 3m / 6m / 1y / All
- Auto-seeds 15 sample signals on first load with deterministic profit data

#### Support Tickets (`/tickets`)
- Create and manage support tickets
- Two-way messaging between user and admin
- Open/closed status tracking

#### ACAP+ Subscription (`/acap-plus`)
- Premium tier with portfolio scanner, personalized suggestions, AI advisor
- Telegram-based activation flow
- Redirects active Plus subscribers directly to `/app/signals`

#### Education (`/education`)
- Landing page for upcoming education academy
- Mentor profiles, learning paths, platform stats

### Admin Panel (`/admin`)

- **User Management**: List all users with ACAP+ status toggle
- **Suggestion System**: Send personalized investment suggestions with profit targets and expiration dates
- **Portfolio Scanner**: Analyze user portfolios against ideal allocation per their investor type
- **Support Tickets**: Full ticket management with reply/close functionality
- **Analytics Dashboard**:
  - Stats cards (total users, Plus users, assets, signals, suggestions, open tickets)
  - 365-day GitHub-style activity heat map
  - Daily signups bar chart (30 days)
  - Daily page views chart (30 days)
  - Event distribution (7 days)
  - Top pages by visit (7 days)
  - Recent price updates
- **CSV Export**: Download all user data with Persian headers

### AI & Intelligence

- **AI Chat Assistant**: Gemini 2.0 Flash responds to investment queries in Persian
- **Portfolio Advisor**: Scores diversity (0–100), detects over-concentration, suggests rebalancing
- **Anomaly Detection**: Z-score algorithm identifies price spikes/drops from historical data
- **Financial Personality Quiz**: 4 investor types (conservative, balanced, growth, aggressive) with recommended asset allocation

---

## Database Schema

### PostgreSQL via Drizzle ORM — 15 tables

#### Better Auth (Authentication)

| Table | Purpose | Key Columns |
|---|---|---|
| `user` | Core user accounts | `id`, `email`, `name`, `role` (user/admin), `banned` |
| `session` | Active sessions | `id`, `token`, `userId`, `expiresAt` |
| `account` | Auth provider accounts | `providerId`, `password`, `userId` |
| `verification` | Email verification tokens | `identifier`, `value`, `expiresAt` |

#### Application

| Table | Purpose | Key Columns |
|---|---|---|
| `user_profile` | Extended user data | `phone`, `age`, `investmentCapital` |
| `quiz_result` | Financial personality test | `score`, `investorType`, `answers` (jsonb) |
| `subscription` | ACAP+ subscription status | `acapPlus`, `scannerActive`, `acapPlusUntil` |
| `suggestion` | Admin→user suggestions | `title`, `content`, `profitPercent`, `expiresAt`, `actualProfit` |
| `ticket` | Support tickets | `subject`, `status` (open/closed) |
| `ticket_message` | Ticket conversations | `message`, `userId` |
| `asset` | User portfolio holdings | `type`, `symbol`, `quantity`, `purchasePrice` |
| `asset_price` | Cached market prices | `type`, `symbol`, `price`, `currency` |
| `iran_stock` | TSETMC stock metadata | `symbol`, `name`, `sector`, `tsetmc_code` |
| `signal` | Investment signals | `type`, `symbol`, `expectedProfit`, `priceAtPublish`, `expiresAt` |
| `user_event` | Analytics events | `event`, `path`, `metadata` (jsonb), `ip` |
| `ml_anomaly` | ML anomaly detection results | `symbol`, `zScore`, `direction`, `detectedAt` |

---

## API Reference

### Public Endpoints

| Method | Route | Description | Cache |
|---|---|---|---|
| `GET` | `/api/prices` | Returns all market prices (crypto, forex, gold, stocks) | 10s CDN |
| `GET` | `/api/signals?months=N` | Investment signals with profit data | Dynamic |
| `GET` | `/api/iran-stocks?search=` | Search Iranian stocks | Dynamic |
| `GET` | `/api/iran-stocks/price?symbol=` | Single stock live price | Dynamic |

### Authenticated Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/chat` | Gemini AI chat (10 req/min/IP) |
| `POST` | `/api/track` | Log user events for analytics |
| `GET` | `/api/acap-plus` | Current user's ACAP+ status + suggestions |
| *`/api/auth/*` | Better Auth | Sign in, sign up, reset password, session |

### Admin Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/admin/analytics` | Full analytics dashboard data |
| `GET` | `/api/admin-check` | Current user admin status |
| `GET` | `/api/export-csv` | Export all user data as CSV |

### Server Actions (via `'use server'`)

- `saveProfile(data)` — Update user profile
- `createAsset(data)` / `updateAsset(id)` / `deleteAsset(id)` — Portfolio CRUD
- `saveQuizResult(data)` — Submit quiz results
- `sendSuggestion(...)` — Admin sends suggestion
- `toggleAcapPlus(userId, enabled)` — Admin toggles subscription
- `createTicket(subject)` / `addMessage(ticketId, msg)` — Support tickets

---

## Data Pipeline

### Price Aggregation — `lib/prices.ts`

```
fetchAllPrices()
    ├── fetchCryptoPrices()     → CoinGecko API (4s timeout)
    │                            → BTC, ETH, USDT, SOL, XRP, ADA, DOGE, BNB, ...
    ├── fetchTgjuData()         → TGJU HTML scrape + AJAX fallback (4s timeout)
    │                            → IRR rates: USD, EUR, AED, GBP, TRY, GOLD18, COIN, BTC, ETH, USDT
    └── fetchTsetmcSearch()     → TSETMC API (3s timeout per stock, parallel)
                                 → فولاد, خودرو, شستا, فملی, کگل, وغدیر, ...
         └── fetchTsetmcPriceInfo() → Live price per instrument code
```

**Fallback Chain**:
1. Primary: scrape TGJU HTML → parse `data-price` attributes
2. Fallback: TGJU AJAX JSON endpoint (`call2.tgju.org/ajax.json`)
3. Fallback: DB `asset_price` table (from last successful fetch)
4. Hardcoded: `USD = 1,709,000 IRR` (last known rate)

### Cache Strategy

```
API Route:      Cache-Control: public, s-maxage=10, stale-while-revalidate=30
                          ↓
              Edge CDN serves cached response
                          ↓
              10s later → revalidate upstream
                          ↓
              Revalidate fails → serve stale (up to 30s)
              Revalidate succeeds → update cache
```

---

## AI & ML Systems

### Gemini Chat (`/api/chat`)

```
[Client] → POST /api/chat { message: "..." }
    ├── Rate limit check (10/min/IP)
    ├── Session check (401 if unauthenticated)
    ├── Sanitization (strip HTML tags, max 2000 chars)
    ├── Gemini 2.0 Flash generation
    │     System prompt: Persian investment advisor persona
    │     with risk disclaimer + professional tone
    └── Response: { success: true, response: "..." }
```

### Anomaly Detection (`lib/ml.ts`)

- **Algorithm**: Z-score on rolling window of 30 price snapshots
- **Threshold**: |z| > 2.5
- **Output**: Detected anomalies stored in `ml_anomaly` table
- **Trigger**: Runs in background after each price fetch

### Portfolio Scoring (`lib/ml.ts`)

- **Diversity Score** (0–100):
  - 4+ asset types → 100, 3 types → 75, 2 types → 50, 1 type → 25
  - Concentration penalty: −25 if single type > 60% of portfolio
- **Output**: Persian-language recommendation text

### Financial Personality Quiz

- 14 questions across 5 personality dimensions
- Scoring algorithm maps to 4 investor types
- Each type has a recommended target allocation:
  - **Conservative**: 40% gold, 30% currency, 20% stock, 10% crypto
  - **Balanced**: 25% gold, 20% currency, 35% stock, 20% crypto
  - **Growth**: 10% gold, 10% currency, 40% stock, 40% crypto
  - **Aggressive**: 5% gold, 5% currency, 30% stock, 60% crypto

---

## Security

### Authentication

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt (via Better Auth) |
| Session management | Cookie-based, httpOnly, secure in production |
| Session expiry | Configurable via Better Auth |
| Rate limiting | Auth routes: 10 req/min/IP (in-memory) |

### API Security

| Layer | Mechanism |
|---|---|
| Rate limiting | Middleware: 30 req/min/IP for all API routes |
| Chat rate limiting | Separate in-memory: 10 req/min/IP |
| CSP Header | Restricted to: CoinGecko, TGJU, TSETMC, Nobitex, jsdelivr |
| HSTS | `max-age=63072000; includeSubDomains; preload` |
| Security Headers | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` |
| Session Check | `auth.api.getSession()` on all protected API routes |
| Admin Check | `requireAdmin()` verifies `user.role === 'admin'` |

### Data Protection

- **No secrets in code**: All credentials via environment variables
- **Git ignored**: `.env.local`, `.env.vercel*`, `.vercel/`
- **SQL Injection**: Prevented by parameterized queries + Drizzle ORM
- **Input sanitization**: Server-side stripping of HTML tags

### Infrastructure

- **SSL/TLS**: Vercel edge network (automatic)
- **DDoS Protection**: Vercel edge network
- **Database**: Neon PostgreSQL with SSL (require mode)
- **Cookie security**: Secure in production, SameSite=Lax

---

## Authentication & Authorization

### Flow

```
                    ┌──────────────┐
                    │  User visits │
                    │  a-cap.xyz   │
                    └──────┬───────┘
                           │
                    ┌──────┴───────┐
                    │  AuthModal   │
                    │  (Sign In)   │
                    └──────┬───────┘
                           │
               ┌───────────┴───────────┐
               │  POST /api/auth/      │
               │  (Better Auth)        │
               └───────────┬───────────┘
                           │
                    ┌──────┴──────┐
                    │  Session    │
                    │  Cookie     │
                    │  set        │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │  Protected Pages/Routes │
              │  auth.api.getSession()  │
              └─────────────────────────┘
```

### Authorization Levels

| Level | Access |
|---|---|
| **Public** | Landing, education, price ticker |
| **Authenticated** | Dashboard, portfolio, prices, signals, tickets, ACAP+, chat |
| **ACAP+** | Portfolio scanner, personalized suggestions, AI advisor |
| **Admin** | `/admin` panel, user management, analytics, CSV export |

---

## Performance Optimizations

| Optimization | Before | After | Impact |
|---|---|---|---|
| Parallel data fetching | 12s sequential | 4s parallel | 67% faster price load |
| Edge caching | Uncached | 10s CDN cache | Eliminates cold-start for repeated requests |
| React.memo on asset cards | Full re-render | Memoized | Reduced re-renders on dashboard |
| Batch DB queries | N individual queries | Single batch query | Reduced DB connections |
| Reduced timeouts | 25s TGJU | 4s all sources | Faster failure recovery |
| Bundle optimization | 30+ unused imports | Removed 10 icons | Reduced JS bundle |
| Remove client TGJU | Duplicate browser fetch | Single server fetch | 50% less bandwidth |
| Global timeout fallback | Request hangs | 8s timeout → DB fallback | Never hangs for users |

---

## Deployment

### Vercel Configuration

```json
{
  "installCommand": "npm install"
}
```

### Build

```bash
npm run build    # next build (TypeScript errors ignored)
npm run lint     # ESLint validation
```

### Environment

Branch `acap-2` deploys to production, aliased to `a-cap.xyz`.

### Database Migrations

```bash
npx drizzle-kit generate    # Generate SQL migration from schema changes
npx drizzle-kit push        # Apply to production database
```

Or use in-app ALTER TABLE for dynamic column additions (signals, suggestions).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `BETTER_AUTH_URL` | Yes | Auth base URL |
| `BETTER_AUTH_SECRET` | Yes | 64-char hex for session signing |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Gemini AI API key |
| `RESEND_API_KEY` | No | Resend email API key |
| `RESEND_FROM` | No | Email sender address |

---

## Project Structure

```
├── app/
│   ├── actions/           # Server actions (profile, assets, quiz, admin, tickets)
│   ├── admin/             # Admin panel page
│   ├── api/               # API routes
│   │   ├── acap-plus/     # ACAP+ status endpoint
│   │   ├── admin/         # Admin analytics & check
│   │   ├── auth/          # Better Auth proxy
│   │   ├── chat/          # Gemini AI chat
│   │   ├── export-csv/    # CSV data export
│   │   ├── iran-stocks/   # TSETMC stock search & price
│   │   ├── prices/        # Aggregated market prices
│   │   ├── signals/       # Investment signals
│   │   └── track/         # Event tracking
│   ├── app/               # Authenticated app pages
│   │   ├── assets/        # Portfolio management
│   │   ├── prices/        # Live price cards
│   │   └── signals/       # Signal dashboard
│   ├── dashboard/         # User dashboard
│   ├── education/         # Academy landing
│   ├── tickets/           # Support tickets
│   └── acap-plus/         # Subscription page
├── components/            # React components
│   ├── ui/                # shadcn/ui primitives
│   ├── navbar.tsx         # Top navigation
│   ├── hero.tsx           # Landing hero
│   ├── auth-modal.tsx     # Auth modal
│   ├── quiz-section.tsx   # Personality quiz
│   ├── portfolio-dashboard.tsx  # Portfolio management
│   ├── portfolio-advisor.tsx    # AI portfolio scoring
│   ├── price-ticker.tsx   # Live price ticker
│   ├── ai-support.tsx     # Floating AI chat
│   └── ...                # Other sections
├── lib/
│   ├── db/
│   │   ├── index.ts       # DB connection (Pool + Drizzle)
│   │   └── schema.ts      # All Drizzle table definitions
│   ├── auth.ts            # Better Auth server config
│   ├── auth-client.ts     # Better Auth client
│   ├── prices.ts          # Market data aggregator
│   ├── ml.ts              # Anomaly detection + portfolio scoring
│   ├── email.ts           # Resend email integration
│   └── utils.ts           # cn() Tailwind helper
├── drizzle/               # Drizzle Kit migration files
├── public/                # Static assets (images, logos)
├── scripts/               # Dev utility scripts
├── middleware.ts          # Rate limiting + security headers
├── next.config.mjs        # Next.js config (CSP, HSTS)
├── vercel.json            # Vercel deploy config
└── package.json           # Dependencies & scripts
```

---

## Development

```bash
# Install
npm install

# Configure
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, BETTER_AUTH_SECRET, etc.

# Run
npm run dev         # http://localhost:3333

# Database
npx drizzle-kit push    # Apply schema to database

# Build
npm run build

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## License

All rights reserved. This project is proprietary software developed for A|CAP.
