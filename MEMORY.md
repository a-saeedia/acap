# ACAP Project Memory

## Sessions

### Session 1 — Gold price fix + Cash asset fix + Admin overhaul + Referral system

**Problem 1: Gold prices wrong on `/api/prices`**
- GOLD24, HALF_COIN (نیم‌سکه), QUARTER_COIN (ربع‌سکه) showing wrong values
- Root cause: `tolerance_high`/`tolerance_low` arrays from TGJU change order daily — some days their `geram24`/`nim`/`rob` items map to wrong (non-gold commodity) values
- Computed fallbacks (GOLD24=GOLD18×4/3, HALF_COIN=COIN×0.5, QUARTER_COIN=COIN×0.288) ran AFTER tolerance extraction, so wrong tolerance values overwrote them
- Fix: Moved computed fallbacks BEFORE tolerance arrays in both `fetchTgjuHTML()` and `fetchTgjuData()` in `lib/prices.ts`. Tolerance arrays guarded with `!prices[sym]`.

**Problem 2: Cash assets invisible in summary tab**
- `getAssetPriceIr()` in `app/app/page.tsx` returned 0 for cash assets (symbol 'CASH' had no price entry)
- Fix: Added `a.type === 'cash'` checks in `totalValue`, `totalCost`, `byType`, and asset list rendering

**Problem 3: Limited stock coverage**
- `DEFAULT_STOCKS` expanded from 15 to 100+ across all sectors

**Problem 4: Admin panel unusable for non-technical co-founder**
- Added DB tables: `site_setting`, `site_comment`, `task`, `task_comment` in `lib/db/schema.ts`
- Created server actions in `app/actions/settings.ts` (CRUD for settings, comments, tasks)
- Created admin components: `admin-settings.tsx` (key-value editor), `admin-comments.tsx` (manage inline annotations), `admin-tasks.tsx` (Kanban board)
- Added `SiteCommentWidget` (floating blue button) to all app pages via `app/app/app-layout.tsx`
- Added 3 new tabs (تنظیمات سایت, نظرات صفحات, وظایف) to `app/admin/page.tsx`

**Problem 5: Telegram/Bale bots hacked**
- All bot links removed from site
- Replaced with in-app referral system:
  - Schema: `referralCode` + `referredBy` on `user_profile`, new `referral` table
  - Server actions: `ensureReferralCode()`, `getMyReferralStats()`, `applyReferralCode()`, `markReferralConverted()`, `getAllReferrals()`, `getReferralLeaderboard()`, `checkAndGrantMilestones()`
  - Auth modal reads `?ref=` query param, calls `applyReferralCode()` after signup
  - Dashboard `ReferralCard` component (code, invite count, tier, milestones, copy-to-clipboard)
  - Ambassador section CTA links to dashboard instead of Telegram bot

**Commit:** `8283a6f` — "feat: referral system, admin referral tab, dashboard referral UI"

---

### Session 2 — AI chat position fix + Plus gate removal + Referral revert

**Problem 1: AI chat icon positioned on right instead of left**
- `components/ai-support.tsx`: button had `fixed bottom-4 right-4`, chat window had `fixed bottom-20 right-4`
- Fix: Changed both to `left-4` instead of `right-4`

**Problem 2: Portfolio Dashboard gated behind A|CAP+ subscription**
- `components/portfolio-dashboard.tsx` had `!isPlus` gate (lines 426-486) blocking all non-plus users
- `app/app/assets/page.tsx` fetched subscription data to set `isPlus` prop
- User was plus but still seeing the gate (possibly stale DB data, or returning user whose subscription record had issues)
- Fix: Removed the `!isPlus` gate entirely from `PortfolioDashboard`, removed `isPlus` prop from the component and its parent page

**Problem 3: Referral system + blank pages + DB schema mismatch from Session 1**
- Session 1 added `referralCode`/`referredBy` columns to `user_profile`, new `referral` table, and migration `0002_wild_killer_shrike`
- The migration was NEVER applied to production DB (ECONNREFUSED from dev machine), so DB schema still matched pre-referral state
- This caused errors retrying endlessly in the background, making summary page blank and site slow
- **Fix:** Reverted all referral additions:
  - Deleted `app/actions/referral.ts`
  - Removed `referralCode`/`referredBy` columns from `user_profile` schema, removed `referral` table
  - Removed referall code import, state, useEffect, signup handling from `auth-modal.tsx`
  - Deleted migration snapshot `0002_snapshot.json` and journal entry
  - Removed admin referral tab from `app/admin/page.tsx`
  - Restored Telegram/Bale bot links in `components/ambassador-section.tsx` and footer
- Build verified: `npm run build` compiles successfully (16.3s)
- Schema now matches production DB exactly

**Commit:** `main` — "revert: remove referral system, restore bot links, fix schema mismatch"

---

### Key Architecture Notes
- Better Auth manages `user` table; `role` property not on session user — admin checks query DB user table
- Payments handled manually via admin panel (toggle A|CAP+), no payment gateway yet
- Gold prices: TGJU HTML parsing + AJAX tolerance fallback + computed math fallback (3-layer)
