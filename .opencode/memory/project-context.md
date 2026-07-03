# Project Context

## Goal
Build A|CAP — a Persian capital management platform at a-cap.xyz with live prices, portfolio tracking, AI signals, academy (21 courses, 76 articles), blog, and path-finding system.

## Stack
- **Framework**: Next.js 16.2.6 (App Router, `'use client'` pages)
- **Language**: TypeScript 5.7 (strict mode)
- **Auth**: Better Auth (email/password, Pool-based DB connection)
- **Database**: Neon PostgreSQL via Drizzle ORM 0.45 + pg 8.21
- **Styling**: Tailwind CSS v4 + tw-animate-css + shadcn/ui (base-nova style)
- **Animations**: Framer Motion 12.40
- **Icons**: Lucide React 1.16
- **Email**: Resend (password reset)
- **UI Components**: shadcn/ui (base-nova), Radix (progress, tabs), Base UI React
- **Analytics**: @vercel/analytics 1.6.1
- **Deployment**: Vercel (auto-deploys from `main`, aliased to a-cap.xyz)
- **Font**: Vazirmatn (Farsi), Geist Mono

## Directory Structure
```
├── app/
│   ├── api/
│   │   ├── auth/[...all]/route.ts       — Better Auth handler
│   │   ├── prices/route.ts              — TGJU + CoinGecko + TSETMC prices (12s timeout)
│   │   ├── signals/route.ts             — Trading signals with profit calculations
│   │   ├── seed/route.ts                — Academy data seeder
│   │   ├── track/route.ts               — User event tracking
│   │   ├── iran-stocks/route.ts         — Iran stock search
│   │   ├── iran-stocks/price/route.ts   — Iran stock prices
│   │   ├── acap-plus/route.ts           — A|CAP+ subscription
│   │   ├── admin-check/route.ts         — Admin status
│   │   ├── admin/analytics/route.ts     — Admin analytics
│   │   ├── export-csv/route.ts          — CSV export
│   │   ├── chat/route.ts                — AI chat endpoint
│   │   └── email/route.ts               — Email sending
│   ├── actions/
│   │   ├── assets.ts         — CRUD assets, dedup, price fetching
│   │   ├── academy.ts        — Courses, enrollments, paths, articles CRUD
│   │   ├── profile.ts        — User profile, quiz results, dashboard data
│   │   ├── admin.ts          — Admin operations
│   │   ├── quiz.ts           — Quiz operations
│   │   └── tickets.ts        — Ticket system
│   ├── app/ (authenticated)
│   │   ├── layout.tsx        — Sidebar (7 items) + AISupport
│   │   ├── page.tsx          — Portfolio summary (stats, distribution, recent assets)
│   │   ├── assets/page.tsx   — Capital management (static import + 10s timeout)
│   │   ├── prices/page.tsx   — Live prices (TGJU + CoinGecko + TSETMC), USDT hidden
│   │   ├── signals/page.tsx  — A|CAP revenue/signal suggestions
│   │   ├── personal/page.tsx — Personal signals
│   │   ├── academy/page.tsx  — Academy landing (Harvard/MIT dark theme)
│   │   ├── academy/catalog/page.tsx         — Filterable course grid
│   │   ├── academy/courses/[slug]/page.tsx  — Course detail + enrollment
│   │   ├── academy/dashboard/page.tsx       — Student progress
│   │   └── academy/path/page.tsx            — Quiz → money-making path finder
│   ├── blog/page.tsx           — Blog listing (search, categories, pagination)
│   ├── blog/[slug]/page.tsx    — Article detail (content renderer, SEO)
│   ├── dashboard/dashboard-client.tsx — Main dashboard (mosaic tiles, timeouts)
│   └── globals.css — Design tokens, CSS variables, night/light modes
├── components/
│   ├── navbar.tsx, hero.tsx, footer.tsx — Public homepage
│   ├── quiz-section.tsx, about-section.tsx, founders-section.tsx
│   ├── services-section.tsx, faq-section.tsx, ambassador-section.tsx
│   ├── auth-modal.tsx, terms-modal.tsx, theme-provider.tsx
│   ├── portfolio-dashboard.tsx, portfolio-advisor.tsx
│   ├── price-ticker.tsx, ai-support.tsx, error-boundary.tsx
│   ├── onboarding-tasks.tsx
│   └── ui/button.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts          — Pool (max 5, 10s timeout) + Drizzle instance
│   │   └── schema.ts         — 21 tables (see DB Schema below)
│   ├── prices.ts             — TGJU HTML+AJAX, CoinGecko, TSETMC fetchers
│   ├── seed.ts               — 76 articles, 21 courses, 6 learning paths
│   ├── ml.ts                 — Z-score anomaly detection + portfolio diversity scoring
│   ├── auth.ts               — Better Auth config (Pool, trusted origins)
│   ├── auth-client.ts        — Client-side auth (signIn, signUp, signOut, useSession)
│   ├── email.ts              — Resend password reset email
│   └── utils.ts              — Tailwind merge utility
├── middleware.ts              — Rate limiting (auth: 10/min, API: 30/min) + security headers
├── next.config.mjs            — CSP headers, TS errors ignored in build, unoptimized images
├── drizzle.config.ts          — Drizzle Kit config (schema, pg, output dir)
├── tsconfig.json              — strict, paths @/*, bundler module resolution
├── vercel.json                — installCommand: npm install
└── components.json            — shadcn/ui config (base-nova style)
```

## Database Schema (21 tables - lib/db/schema.ts)

### Better Auth (4 tables)
| Table | Key Columns |
|-------|-------------|
| `user` | id, name, email, emailVerified, image, role, banned, banReason, banExpires |
| `session` | id, expiresAt, token, userId, ipAddress, userAgent |
| `account` | id, accountId, providerId, userId, accessToken, refreshToken, password |
| `verification` | id, identifier, value, expiresAt |

### App Tables (7 tables)
| Table | Key Columns |
|-------|-------------|
| `user_profile` | id, userId, phone, age, investmentCapital, role |
| `quiz_result` | id, userId, name, phone, score, investorType, answers (jsonb) |
| `subscription` | id, userId, acapPlus, acapPlusSince, acapPlusUntil, scannerActive |
| `suggestion` | id, userId, adminId, title, content, isRead, profitPercent, profitMessage, expiresAt, actualProfit |
| `ticket` | id, userId, subject, status (open/closed) |
| `ticket_message` | id, ticketId, userId, message |
| `asset` | id, userId, type, symbol, label, quantity, purchasePrice, purchaseDate, notes |
| `iran_stock` | id, symbol (unique), name, sector, tsetmc_code |
| `asset_price` | id, type, symbol, price, currency, source, updatedAt |
| `user_event` | id, userId, event, path, metadata (jsonb), ip, userAgent |
| `signal` | id, type (crypto/stock/gold), symbol, title, action (buy/sell), priceAtPublish, investorType, expectedProfit, expiresAt |
| `ml_anomaly` | id, symbol, zScore, currentPrice, meanPrice, stdPrice, direction (spike/drop) |

### Academy Tables (5 tables)
| Table | Key Columns |
|-------|-------------|
| `course` | id, title, slug (unique), description, longDescription, category (ict/ai/stock/forex/crypto/blockchain/trading/psychology), instructor (ali-borhan/arman-saeedi), price (bigint), originalPrice, duration, level (beginner/intermediate/advanced), lessons, videoHours, color, icon, isPopular, isNew, isBestseller, rating, studentsCount, whatYouLearn (jsonb), syllabus (jsonb) |
| `enrollment` | id, userId, courseId, progress, completedLessons, startedAt, completedAt |
| `learning_path` | id, title, slug (unique), description, icon, color, minScore, maxScore, investorType, incomePotential, timeToFirstIncome, requiredCapital, difficulty, courseIds (jsonb) |
| `article` | id, title, slug (unique), excerpt, content, categoryId, author, authorRole, image, tags (jsonb), readingTime, isFeatured, views |
| `article_category` | id, name, slug (unique), description, color, icon, order |

## External API Integrations
1. **TGJU** (call2.tgju.org + www.tgju.org) — Gold, currency, crypto IRR prices. HTML scrape first, AJAX fallback. 4s timeout. Returns: USD, EUR, AED, GBP, TRY, CHF, CNY, CAD, AUD, SGD, INR, SAR, KWD, MYR, RUB, AZN, GOLD18, GOLD24, COIN, HALF_COIN, QUARTER_COIN, XAU, MESGHAL, BTC-IRR, ETH-IRR, DASH-IRR, XRP-IRR, LTC-IRR
2. **CoinGecko** (api.coingecko.com) — Crypto USD prices. 16 coins tracked: BTC, ETH, USDT, BNB, SOL, XRP, ADA, DOGE, DOT, MATIC, SHIB, TRX, AVAX, LINK. 4s timeout.
3. **TSETMC** (cdn.tsetmc.com) — Iran stock prices. Search by symbol, get closing price info. 4s timeout. 15 default stocks (فولاد, خودرو, وغدیر, کگل, فملی, شستا, وبملت, وتجارت, پارسان, تاپیکو, شپنا, شتران, خساپا, وبصادر, رمپنا).
4. **Resend** — Password reset emails.
5. **Vercel Analytics** — Web vitals tracking.

## Price Flow (`/api/prices`)
1. Fetch stocks from DB (or seed defaults if empty)
2. Fetch TSETMC codes for stocks without codes (timeboxed 3s)
3. Parallel: CoinGecko (crypto) + TGJU (gold/forex) + TSETMC (stocks) — ~4s total
4. If TGJU fails, fallback to DB asset_price table, then hardcoded FALLBACK_USD_RATE (1709000)
5. Convert crypto USD prices to IRR using TGJU rate
6. DB fallback for symbols missing from live data
7. Batch upsert asset_prices (insert new, update existing)
8. DB fallback for stocks without live TSETMC data
9. Run ML anomaly detection in background
10. 12s global timeout via Promise.race. Return empty JSON on timeout.

## Page Routes Summary
| Route | Type | Purpose |
|-------|------|---------|
| `/` | Public | Landing: hero, navbar, quiz, services, about, founders, footer, price ticker |
| `/dashboard` | Protected | Main dashboard: mosaic tiles (portfolio CTA + prices + revenue badges), profile stats, quiz history |
| `/app` | Protected | Portfolio summary: stats, distribution chart, recent assets |
| `/app/assets` | Protected | Capital management: CRUD assets, portfolio dashboard |
| `/app/prices` | Protected | Live prices: gold, currency, crypto, stocks (USDT hidden) |
| `/app/signals` | Protected | A|CAP revenue: signal suggestions with profit tracking |
| `/app/personal` | Protected | Personal signals list |
| `/app/academy` | Protected | Academy landing: hero, featured courses, instructors, stats, CTA |
| `/app/academy/catalog` | Protected | Course catalog: filters (category, level, instructor, search, sort) |
| `/app/academy/courses/[slug]` | Protected | Course detail: syllabus accordion, enrollment, related courses |
| `/app/academy/dashboard` | Protected | Student dashboard: enrolled courses, progress bars |
| `/app/academy/path` | Protected | Path finder: quiz → money-making recommendations with income/capital figures |
| `/blog` | Public | Blog listing: search, category pills, featured row, pagination |
| `/blog/[slug]` | Public | Article detail: content renderer, tags, share buttons, related articles |
| `/admin` | Protected | Admin panel: subscriptions management, user management |

## Design System (globals.css)
- **Night mode** (default): bg #0D1B2A, fg #E4EAF5, primary #3B82F6, accent #1A3350
- **Light mode** (`.light`): bg #F5F7FA, fg #0F1E3A, primary #1565C0
- **Academy theme** (Harvard/MIT): crimson #A51C30, gold #D4A843, goldLight #F0D68A, glassmorphism
- **Font**: Vazirmatn (Farsi, via jsDelivr CDN)
- **Components**: glass (.glass class with backdrop-blur), gradient buttons, rounded-2xl cards
- **Dashboard mosaic**: orange gradient (#EA580C) CTA card (2/3 width) + blue (#2563EB) prices + purple (#7C3AED) revenue mini squares stacked (1/3 width)

## Seed Data (`lib/seed.ts`)
- **76 articles** across 8 categories (market-analysis: 8, investing: 12, crypto: 10, ai: 10, iran-stock: 10, financial-personality: 6, market-psychology: 8, forex: 6) — Persian titles, SEO-optimized, some featured
- **21 courses** with full data:
  - Ali Borhan (10 ICT + 3 stock/forex/trading): prices 6.5M–13M, 4.5–4.9 rating
  - Arman Saeedi (3 AI): prices 5M–15M, 4.7–4.9 rating
  - Others: crypto, blockchain, DEX, trading, psychology
  - All have syllabus (some full, some empty arrays), whatYouLearn arrays, category/level/instructor
- **6 learning paths**: beginner-investor, day-trader, professional-investor, ai-income-path, international-trader, iran-stock-master — each with income potential, time to first income, required capital, difficulty

## Key Decisions
- Prices + signals added BACK to sidebar after user complained about navigation context
- Dashboard mosaic: CTA 2/3 + mini squares 1/3 (not equal 3-column grid)
- Academy: Harvard/MIT dark theme (crimson, gold, glass cards) instead of generic education
- Seed data created programmatically (not user-generated) — 76 articles + 21 courses + 6 paths
- Path-finding maps quiz investorType → paths with concrete income figures
- `'/education'` → redirects to `'/app/academy'`
- Static imports preferred over dynamic for dashboard data fetching (fixes assets showing zero)
- `typescript.ignoreBuildErrors: true` in next.config — TS check is done manually via `npx tsc --noEmit`
- CSP includes 'unsafe-eval' + 'unsafe-inline' (needed by Framer Motion)
- DB pool ping (SELECT 1) on import to warm connection
- Fallback USD rate baked into code (1709000 IRR/USD) when external APIs fail

## Known Issues / Gotchas
- All app/blog pages are `'use client'` — no per-page metadata without converting to server components
- Gold XAU price from TGJU is in IRR (was incorrectly labeled USD — FIXED)
- USDT should NOT appear in crypto category on prices page (was showing — FIXED)
- TSETMC often returns non-JSON (blocked by Vercel IPs) — handled with content-type check
- Dashboard has AbortController (8s) + getDashboardData has 10s + /api/prices has 12s timeout
- CSP connect-src includes multiple TGJU URLs (call2, call3, call4) for fallback
- Assets page crashed at dashboard load (dynamic import timeout — FIXED with static import)
- TS type errors across 7 files — ALL FIXED, zero errors verified

## Memory Files (this directory)
| File | Purpose |
|------|---------|
| `project-context.md` | Permanent: goal, architecture, DB schema, APIs, design, seed data |
| `session-log.md` | Append-only log of every session's changes |
| `progress.md` | Current state: done checklist, in-progress, blockers, next steps |
