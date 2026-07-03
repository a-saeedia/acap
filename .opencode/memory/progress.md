# Progress

## Done
### Dashboard & Navigation
- [x] Dashboard 3-tile mosaic: orange CTA (2/3) + stacked mini squares (1/3) for Prices and Revenue
- [x] Sidebar with 7 items: Portfolio, دارایی‌ها, قیمت‌ها, درآمد A|CAP, سیگنال‌های شخصی, آکادمی, وبلاگ
- [x] "بازگشت به داشبورد" buttons on /app/prices, /app/signals, /app/personal
- [x] AbortController (8s) on dashboard fetch calls + static imports
- [x] 10s timeout on getDashboardData() in assets page
- [x] 12s global timeout on /api/prices Promise.race

### Price Fixes
- [x] Gold XAU currency fixed: 'USD' → 'IRR' in both fetchTgjuHTML() + fetchTgjuData()
- [x] USDT removed from crypto category on prices page
- [x] Change property type safety in merged prices

### Build Quality
- [x] Zero TypeScript errors across entire project (npx tsc --noEmit passes)
- [x] Fixed TS errors: blog/[slug], blog/page, signals/page, assets/page, academy actions
- [x] Fixed: admin subscription nullability, onboarding-tasks ease type, portfolio-dashboard timeout
- [x] Dead code block (signals/personal tabs) removed from prices page
- [x] Missing useRouter import added to signals page

### Academy System
- [x] DB schema: course, enrollment, learning_path, article, article_category tables
- [x] Server actions: full CRUD (getCourses, getCourseBySlug, getMyEnrollments, enrollInCourse, getLearningPaths, getPathRecommendations, getArticles, getArticleBySlug, getArticleCategories)
- [x] Seed script: 76 Persian SEO-optimized articles, 21 courses (viral titles, tiered pricing 5M-15M), 6 learning paths (with income potential, time to first income, required capital)
- [x] Seed API at GET /api/seed (returns counts)
- [x] Academy landing page (Harvard/MIT dark academic: crimson #A51C30, gold, glassmorphism)
- [x] Course catalog with filters (category, level, instructor, search, sort)
- [x] Course detail page with syllabus accordion, enrollment, related courses
- [x] Student dashboard with progress tracking
- [x] Path-finding quiz: maps investorType → money-making recommendations
- [x] Blog listing with search, category pills, featured row, pagination
- [x] Article detail page with content renderer, tags, share buttons, related articles
- [x] Old /education page → redirects to /app/academy

### Deployment
- [x] Force-pushed `acap-2` branch → `main` (twice, after mistaken stale push)
- [x] Seed data populated via GET /api/seed (76 articles, 21 courses, 6 paths)
- [x] Vercel auto-deploys from main aliased to a-cap.xyz

### Memory System
- [x] Created .opencode/memory/ with project-context.md, session-log.md, progress.md
- [x] Deep codebase scan — all 21 DB tables, all API routes, all pages, all actions documented
- [x] Full design system, seed data, external APIs, and known gotchas captured

### Security + Polish
- [x] `/api/seed` locked behind admin authentication
- [x] DB pools consolidated (was 2 separate Pools, now 1 shared)
- [x] `.gitignore` now excludes plain `.env` files
- [x] `typescript.ignoreBuildErrors` set to `false` (build fails on TS errors)
- [x] Suggestion table: added missing `profit_percent` and `profit_message` columns
- [x] Branded OG image generated (SVG + PNG, 1200×630, dark theme + A|CAP branding)

## In Progress
- (none)

## Done (Admin Dashboard Enhancement)
- [x] Added "Content" tab to admin panel with 3 sub-tabs:
  - Courses table (title, category, instructor, level, price, enrollment count, rating, students)
  - Articles table (title, category, views, reading time, publish date)
  - Enrollments table (user, course, progress %, start date, completion status)
- [x] Added course revenue tracking to analytics (per-course enrollments + potential revenue)
- [x] Added server actions: getAdminCourses, getAdminArticles, getAdminEnrollments
- [x] Extended `/api/admin/analytics` with course/article/enrollment counts + course revenue data

## Blocked
- **Google Search Console verification** — needs user to provide TXT record value
- **Brand/founder data** for Gemini scripts — pending user input

## Next Steps (Priority Order)
1. **Course enrollment with payment** — integrate payment gateway for the 21 courses (5M–15M Tomans)
2. **Admin dashboard** — UI for managing courses, articles, users
3. **User-generated content** — blog comments, course ratings/reviews
4. **Video lesson pages** — actual lesson content delivery for enrolled courses
5. **Stock search coverage** — improve TSETMC stock search for more symbols
6. **Convert key pages to server components** — for proper per-page SEO metadata (currently blocked by `'use client'` architecture)
7. **Tighten CSP** — try to reduce `unsafe-eval`/`unsafe-inline` in Content-Security-Policy
