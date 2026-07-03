# Session Log

## SESSION 001 — Dashboard Polish + Academy Build

### Changes Made

**Dashboard Speed Fixes**
- Added AbortController (8s timeout) to `/api/prices` and `/api/signals` fetch calls in dashboard-client.tsx
- Added 10s timeout to `getDashboardData()` call in assets page
- Changed `import('@/app/actions/assets')` dynamic import → static import
- Added global 12s timeout to `/api/prices` route handler via Promise.race

**Price Fixes**
- XAU gold ounce currency changed from 'USD' → 'IRR' in both `fetchTgjuHTML()` and `fetchTgjuData()` fallback in `lib/prices.ts`
- USDT removed from prices page crypto category (app/app/prices/page.tsx)
- Fixed type safety for `change` property in merged prices

**Build Quality**
- Fixed TS errors in: blog/[slug]/page.tsx, blog/page.tsx, app/signals/page.tsx, app/assets/page.tsx, app/actions/academy.ts
- Fixed all 7 pre-existing errors: admin subscription nullability, onboarding-tasks ease type, portfolio-dashboard timeout
- Verified: `npx tsc --noEmit` passes with zero errors

**Academy System (Major Feature)**
- DB tables: `course`, `enrollment`, `learning_path`, `article`, `article_category` in `lib/db/schema.ts`
- Server actions: `app/actions/academy.ts` — CRUD + query functions
- Seed script: 76 SEO-optimized Persian articles, 21 courses with viral titles, 6 learning paths
- Seed API: `/api/seed` (returns count of seeded items)
- 7 new pages (all Harvard/MIT dark academic theme):
  - `/app/academy` — landing with hero, featured courses, stats
  - `/app/academy/catalog` — filterable grid (category, level, instructor, search, sort)
  - `/app/academy/courses/[slug]` — detail with syllabus accordion, enrollment
  - `/app/academy/dashboard` — student progress with enrollment list
  - `/app/academy/path` — quiz-based path finder with income/capital figures
  - `/blog` — listing with search, categories, pagination
  - `/blog/[slug]` — detail with content renderer, SEO metadata
- Sidebar: "آکادمی" link added
- Old `/education` page → redirects to `/app/academy`

**Deployment**
- Force-pushed `acap-2` branch to `main` (after mistakenly pushing stale main first)
- Seed data populated via `GET /api/seed`
- Vercel deploys from `main` aliased to `a-cap.xyz`

### Fixes Applied
- TS type errors across 7 files
- Dynamic import → static import for assets actions
- Gold currency mislabeled as USD (should be IRR)
- USDT showing in crypto prices (should not)
- Prices/signals tabs with no sidebar navigation context
- Missing `useRouter` import in signals page
- Dead code block (signals/personal tabs) removed from prices page
- Admin subscription page: nullability errors fixed
- Onboarding-tasks: framer-motion variants type fixed
- Portfolio-dashboard: timeout variable shadowing fixed

## SESSION 002 — Memory System Created
- Created `.opencode/memory/` with project-context.md, session-log.md, progress.md
- User wanted persistent memory across sessions for better continuity

## SESSION 003 — Security Audit + Fixes + OG Images
### Security Fixes
- **CRITICAL**: `/api/seed` now requires admin authentication (checks session + role)
- **CRITICAL**: Consolidated two separate DB pools (lib/auth.ts + lib/db/index.ts) into one shared pool from lib/db/index.ts
- **HIGH**: Added `.env` to `.gitignore` (plain `.env` would have been committed)
- **MEDIUM**: `typescript.ignoreBuildErrors` changed from `true` → `false` (build now fails on TS errors)

### Broken Items Fixed
- **Suggestion form columns**: Added ALTER TABLE for `profit_percent` and `profit_message` columns in signals route migration section

### OG Images
- Created branded 1200×630 SVG OG image at `public/og.svg` (dark theme, A|CAP branding, Persian tagline, feature badges)
- Converted SVG → PNG at `public/og.png` via sharp (works on all social platforms)
- Deep codebase scan: all 21 DB tables, 12 API routes, 6 server actions, full seed data captured in memory

### Verification
- `npx tsc --noEmit` passes with zero errors
- Build would now fail on TS errors (ignoreBuildErrors: false)
