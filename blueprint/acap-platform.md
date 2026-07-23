# A|CAP Platform — Blueprint

## 1. Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| Language | TypeScript (strict) |
| Rendering | Mostly client-side (`'use client'`), some server components |
| Database | PostgreSQL + Drizzle ORM (8 migrations) |
| Auth | Better Auth (email/password, sessions, accounts, verification) |
| UI | Tailwind CSS v4, Framer Motion, Lucide icons |
| Integrations | Nobitex, TGJU, Tsetmc, CoinGecko, Google Gemini AI, Resend |
| Hosting | Vercel (Vercel Cron Jobs for price updates) |
| Middleware | Custom `proxy.ts` for rate limiting + security headers |

## 2. Route Structure

### Public / Marketing (`app/`)
| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Landing page with hero, quiz, services, blog, pricing, team |
| `/blog` | `app/blog/page.tsx` | Blog listing |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Article detail |
| `/acap-plus` | `app/acap-plus/page.tsx` | Subscription / A|CAP+ pricing page |
| `/education` | `app/education/page.tsx` | Education landing (redirects to /app/academy) |
| `/tickets` | `app/tickets/page.tsx` | Support ticket list / form |
| `/scan` | `app/scan/page.tsx` | Portfolio scanner tool |
| `/self-destruct` | `app/self-destruct/page.tsx` | Account deletion |
| `/reset-password` | `app/reset-password/page.tsx` | Password reset |

### Admin (`app/`)
| Route | Description |
|---|---|
| `/admin` | Admin dashboard (analytics, signals, users, settings, comments, tasks) |
| `/admin-setup` | One-time admin account creation |

### App / Dashboard (`app/app/`)
All under `app-layout.tsx` which provides sidebar navigation and session guard.

| Route | Description |
|---|---|
| `/app` | Main dashboard — portfolio overview, prices, account info, quiz CTA |
| `/app/assets` | Asset management (CRUD for portfolio holdings) |
| `/app/prices` | Market prices (crypto, gold, USD, stocks) |
| `/app/revenue` | **A|CAP Revenue** — signal performance, bar chart, feed |
| `/app/personal` | Personal signals (A|CAP+ feature) |
| `/app/academy` | Course catalog dashboard |
| `/app/academy/courses/[slug]` | Individual course page |
| `/app/academy/catalog` | Full course listing |
| `/app/academy/path` | Learning paths |
| `/app/invite` | Referral / invite friends |

## 3. Database Schema (all tables in `lib/db/schema.ts`)

### Auth (Better Auth)
- `user` — id, name, email, role, banned, timestamps
- `session` — token-based sessions with expiry
- `account` — OAuth / credential accounts with password hash
- `verification` — Email verification tokens

### App Tables
| Table | Purpose |
|---|---|
| `user_profile` | Extended profile (phone, age, capital, referral code) |
| `referral` | Referral tracking (referrer → referred, rewards) |
| `quiz_result` | Personality quiz (investor type, score, answers JSON) |
| `subscription` | A|CAP+ subscription status, trial, scanner toggle |
| `suggestion` | AI-generated trade suggestions (with actual profit tracking) |
| `ticket` / `ticket_message` | Support tickets |
| `asset` | User portfolio holdings (type, symbol, quantity, price) |
| `iran_stock` | Iranian stock metadata (symbol, TSE code) |
| `asset_price` | Cached prices (type, symbol, price, currency, source) |
| `user_event` | Analytics / tracking events |
| `signal` | Trade signals (type, symbol, action, profit, visibility) |
| `acap_revenue` | Monthly revenue records (amount, month, year) |
| `ml_anomaly` | ML-detected price anomalies (z-score based) |
| `course` | Academy courses (metadata, syllabus JSON, pricing) |
| `enrollment` | User-course enrollment with progress |
| `site_setting` | Key-value site configuration via admin panel |
| `site_comment` | Inline page annotations / feedback |
| `task` / `task_comment` | Internal task management (Trello-like) |

## 4. API Routes (`app/api/`)

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...all]` | ALL | Better Auth handler (login, register, session, etc.) |
| `/api/prices` | GET | Aggregated market prices (crypto + stocks + gold) |
| `/api/signals` | GET | Public trade signals |
| `/api/revSignals` | GET | Revenue signal data with month filtering |
| `/api/admin-check` | GET | Check if current user is admin |
| `/api/admin/analytics` | GET | Admin analytics data |
| `/api/admin/populate-signals` | POST | Seed signal data |
| `/api/admin-force-reset` | POST | Force reset admin status |
| `/api/admin-setup` | POST | One-time admin account setup |
| `/api/track` | POST | Analytics event tracking |
| `/api/chat` | POST | AI chat (Google Gemini proxy) |
| `/api/upload` | POST | File upload (images, audio) |
| `/api/export-csv` | GET | Export data as CSV |
| `/api/seed` | GET | Database seeding |
| `/api/migrate` | GET | Database migration trigger |
| `/api/og` | GET | Open Graph image generation |
| `/api/acap-plus` | POST | A|CAP+ subscription request |
| `/api/cron/prices` | GET | Scheduled price update (Vercel Cron) |
| `/api/iran-stocks` | GET | Iranian stock list |
| `/api/iran-stocks/price` | GET | Individual stock price |

## 5. Server Actions (`app/actions/`)

| File | Purpose |
|---|---|
| `profile.ts` | Get/update dashboard data and user profile |
| `assets.ts` | CRUD for user portfolio assets |
| `admin.ts` | Admin operations (users, signals, settings, analytics) |
| `quiz.ts` | Quiz result submission and retrieval |
| `referral.ts` | Referral stats and rewards |
| `academy.ts` | Course data and enrollment |
| `tickets.ts` | Support ticket CRUD |
| `settings.ts` | User preferences |

## 6. External Integrations

### Market Data (`lib/prices.ts`)
- **Nobitex** — Iranian crypto exchange (USDT/IRT, crypto prices)
- **TGJU** — Gold, currency, coin rates
- **Tsetmc** — Tehran Stock Exchange (stock search, closing prices)
- **CoinGecko** — Global crypto prices (fallback / additional data)

### AI
- **Google Gemini AI** (`@google/generative-ai`) — Chat endpoint (`/api/chat`)

### Email
- **Resend** — Transactional emails (onboarding, notifications)

### OG Images
- `/api/og` — Dynamic Open Graph image generation

## 7. Key Components (`components/`)

### Landing / Marketing
`hero.tsx`, `services-section.tsx`, `quiz-section.tsx`, `blog-section.tsx`, `faq-section.tsx`, `about-section.tsx`, `pricing-section.tsx`, `ambassador-section.tsx`, `founders-section.tsx`, `footer.tsx`, `acap-offers.tsx`

### Auth
`auth-modal.tsx`, `onboarding-tasks.tsx`, `terms-modal.tsx`

### Dashboard
`portfolio-dashboard.tsx`, `portfolio-advisor.tsx`, `revenue-widget.tsx`, `price-ticker.tsx`, `invitation-tab.tsx`, `referral-card.tsx`

### Admin
`admin/admin-tasks.tsx`, `admin/admin-settings.tsx`, `admin/admin-comments.tsx`

### Shared
`navbar.tsx`, `tracker.tsx`, `theme-provider.tsx`, `error-boundary.tsx`, `content-renderer.tsx`, `upload-btn.tsx`, `self-destruct-guard.tsx`, `persian-datetime-picker.tsx`

## 8. Auth Flow

1. **Better Auth** handles all auth via `/api/auth/[...all]`
2. Client uses `useSession()` from `@/lib/auth-client` (Better Auth React hook)
3. Server uses `lib/auth.ts` to create the Better Auth instance (database adapter)
4. Auth modal (`auth-modal.tsx`) handles login/register UI
5. Session is persisted via HTTP-only cookies
6. Route protection: `app-layout.tsx` redirects to `/` if no session
7. Admin routes check `/api/admin-check`
8. Rate limiting via `proxy.ts`: 10 req/min for auth, 30 req/min for other APIs

## 9. UI Patterns

### Dashboard Glass-morphism Theme
- Background: `bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl border border-white/[0.08]`
- Text: `text-white`, `text-gray-400`, `text-gray-500`
- Interactive: `hover:border-white/[0.15] hover:bg-white/[0.08] transition-all`
- Buttons: `bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold`
- Active tab: `bg-blue-600 text-white shadow-lg shadow-blue-900/30`
- Inactive tab: `text-gray-400 hover:text-white`

### Layout
- Sidebar: `w-64 bg-gray-900/95 border-l border-gray-800`, collapsible
- Content: fluid, max-width constrained by grid
- Responsive: mobile-first with `md:`, `lg:` breakpoints
- Scrollbar: always visible on desktop, hidden on mobile

### Container Variants (Framer Motion)
```ts
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }
```

## 10. State Management
- No global state library (no Redux, Zustand, etc.)
- Local `useState`/`useEffect` per page
- Server actions for data fetching (with revalidation)
- Inline fetch calls for real-time data (prices, signals)
- Data flow: server action → JSON → client state

## 11. Cron / Automation
- `/api/cron/prices` — Vercel Cron Job for periodic price fetching
- Price fetching runs at configured intervals from `lib/prices.ts`
- ML anomaly detection (`lib/ml.ts`) computes z-scores for price deviations

## 12. Project Conventions
- File naming: kebab-case for routes, camelCase for components
- All dashboard pages use `'use client'`
- Server actions in `app/actions/` use `'use server'`
- Imports use `@/` alias (e.g. `@/lib/utils`, `@/components/navbar`)
- No CSS modules — all styling via Tailwind utility classes
- No unit tests found in the codebase
