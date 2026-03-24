# Qadaa (قضاء) — Design Spec

**Date:** 2026-03-24
**Status:** Approved

---

## Context

Qadaa is a spiritual, gamified prayer recovery tracker for Muslims who have missed prayers (قضاء) and want to systematically make them up. The app calculates the total number of missed prayers based on the user's history, then lets them log daily recovery with streaks, levels, badges, and points to stay motivated. It is a PWA — installable and fully offline-capable — with Arabic as the primary language and English as a secondary toggle.

---

## Tech Stack

All packages are installed at their latest stable versions. The versions below are known-stable as of 2026-03-24 and should be used explicitly in `package.json`.

| Package | Version | Category | Notes |
|---|---|---|---|
| `vite` | `^8.0.0` | devDep | Node 20.19+ required |
| `@vitejs/plugin-react` | `^6.0.0` | devDep | Uses Oxc, no Babel |
| `tailwindcss` | `^4.2.0` | devDep | Zero-config, single CSS `@import` |
| `@tailwindcss/vite` | `^4.2.0` | devDep | Vite plugin for Tailwind v4 |
| `vite-plugin-pwa` | `^1.2.0` | devDep | Service worker + manifest |
| `typescript` | `^5.x` | devDep | |
| `@types/canvas-confetti` | `^1.9.0` | devDep | Types for canvas-confetti |
| `react` | `^19.0.0` | dep | |
| `react-dom` | `^19.0.0` | dep | |
| `react-router` | `^7.13.0` | dep | Import from `"react-router"` |
| `zustand` | `^5.0.0` | dep | With `persist` middleware |
| `motion` | `^12.38.0` | dep | Import from `"motion/react"` |
| `react-i18next` | `^16.0.0` | dep | AR + EN |
| `i18next` | `^25.0.0` | dep | |
| `canvas-confetti` | `^1.9.4` | dep | Milestone celebrations |

---

## Architecture

Client-side only SPA. No backend, no API. All state in Zustand with `persist` middleware → LocalStorage. PWA for offline + installability.

### File Structure

```
qadaa/
├── public/
│   ├── icons/
│   │   ├── icon-192.png          # Standard PWA icon
│   │   ├── icon-512.png          # Standard PWA icon
│   │   └── icon-512-maskable.png # Maskable icon (required for Android / Lighthouse ≥ 90)
│   └── fonts/
│       └── tajawal/              # Self-hosted Tajawal font files (woff2)
├── src/
│   ├── main.tsx                  # React root, i18n init, CSS import
│   ├── App.tsx                   # createBrowserRouter + RouterProvider
│   ├── i18n.ts                   # i18next config (ar + en)
│   ├── store/
│   │   └── store.ts              # Zustand store + all actions
│   ├── screens/
│   │   ├── WizardScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   ├── PrayerRow.tsx         # Prayer name + circular SVG progress + +1 button
│   │   ├── TodayBanner.tsx       # Today's logged count / 5 progress bar
│   │   ├── StreakBadge.tsx       # Streak count + level chip
│   │   ├── BadgeCard.tsx         # Badge display (locked / unlocked)
│   │   └── confetti.ts           # canvas-confetti imperative helper (not a component)
│   ├── hooks/
│   │   └── useStreak.ts          # Selector: reads streak/lastLogDate from store, exposes isStreakAtRisk
│   └── locales/
│       ├── ar.json
│       └── en.json
├── tailwind.css                  # Single line: @import "tailwindcss"
├── vite.config.ts
└── index.html                    # dir="rtl" default, lang="ar" default
```

**`confetti.ts`** is a plain module that exports:
```ts
export function fireConfetti(): void  // fires canvas-confetti with default settings
```
Called imperatively from action handlers after milestone checks.

**`useStreak.ts`** is a thin Zustand selector hook:
```ts
export function useStreak(): { streak: number; isAtRisk: boolean }
// isAtRisk = lastLogDate was yesterday (user hasn't logged today yet)
```
Streak logic lives in the store actions; this hook is read-only.

### Routing (React Router v7 data router)

Use `createBrowserRouter` / `RouterProvider` (not the legacy `BrowserRouter`). Deploy at root `/` — no `basename` needed.

```ts
const router = createBrowserRouter([
  { path: "/",          element: <RootRedirect /> },       // see logic below
  { path: "/wizard",    element: <WizardScreen /> },       // redirects to /dashboard if wizardComplete
  { path: "/dashboard", element: <RequireWizard><DashboardScreen /></RequireWizard> },
  { path: "/stats",     element: <RequireWizard><StatsScreen /></RequireWizard> },
  { path: "/settings",  element: <SettingsScreen /> },
])
```

**`RootRedirect`:** Reads `wizardComplete` from the store. If `false` → `<Navigate to="/wizard" replace />`. If `true` → `<Navigate to="/dashboard" replace />`.

**`RequireWizard`:** Reads `wizardComplete` from the store. If `false` → `<Navigate to="/wizard" replace />`. Otherwise renders children.

### Font Loading (Offline-safe)

Tajawal is **self-hosted** in `public/fonts/tajawal/` (download woff2 files from Google Fonts at build time). Reference via `@font-face` in `tailwind.css`. This ensures the font loads offline and eliminates the Google Fonts external dependency conflict with PWA offline caching.

---

## Data Model

```ts
type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

interface PrayerPeriod {
  type: 'missed' | 'regular'
  years: number  // positive number, decimals allowed e.g. 1.5
}

interface PrayerProgress {
  recovered: number  // never exceeds totalMissedDays (capped on increment)
}

interface Badge {
  id: string          // see badge ID list below
  unlockedAt: number  // Unix timestamp ms
}

interface AppState {
  // Onboarding
  wizardComplete: boolean
  age: number
  pubertyAge: number
  periods: PrayerPeriod[]
  totalMissedDays: number  // computed on wizard complete; see formula below

  // Prayer progress — recovered count per prayer, capped at totalMissedDays
  prayers: Record<PrayerKey, PrayerProgress>

  // Today's per-prayer log tracking (persisted, reset daily)
  // Cleared to {} whenever the stored date differs from today's local date on app load or log action
  todayPrayers: Partial<Record<PrayerKey, true>>
  todayDate: string | null  // ISO "YYYY-MM-DD" of the day todayPrayers was last populated

  // Gamification
  streak: number              // consecutive days with at least one log; starts at 0
  lastLogDate: string | null  // ISO "YYYY-MM-DD" in device local time
  loggedDates: string[]       // array of distinct ISO dates ever logged; used for level
  points: number
  badges: Badge[]

  // Settings
  language: 'ar' | 'en'
  notificationTime: string | null  // "HH:MM" device local time, or null
  notificationPermission: 'default' | 'granted' | 'denied'  // cached permission state

  // Actions
  completeWizard: (age: number, pubertyAge: number, periods: PrayerPeriod[]) => void
  logPrayer: (prayer: PrayerKey) => void
  logFullDay: () => void
  setLanguage: (lang: 'ar' | 'en') => void
  setNotificationTime: (time: string | null) => void
  resetAll: () => void
  exportBackup: () => void
  importBackup: (json: string) => boolean  // returns false on parse/validation error
}
```

### Key Formulas

**`totalMissedDays`** (computed once in `completeWizard`, stored):
```ts
totalMissedDays = periods
  .filter(p => p.type === 'missed')
  .reduce((sum, p) => sum + Math.round(p.years * 365), 0)
```
`regular` periods are collected in the wizard for display/context only; they do not subtract from `totalMissedDays`. The model intentionally assumes all 5 prayers were equally missed per day (a documented simplification — not all fiqh schools require this granularity and per-prayer historical tracking is impractical).

The wizard does **not** validate that the sum of period years equals `age - pubertyAge`. These are independent inputs. A user may enter approximate years; the wizard is an estimation tool, not a strict calculator.

The Quick Mode number input uses `step="0.5"` (min 0.5, max 99). The live preview shows the rounded result: `Math.round(years * 365)` days. The Advanced mode period rows also use `step="0.5"`, `min="0.5"`.

**Progress % per prayer** (derived, not stored):
```ts
progress = (prayers[key].recovered / totalMissedDays) * 100  // 0–100
```

**Level** (derived from `loggedDates`, not stored):
```ts
level = Math.floor(loggedDates.length / 30) + 1
```

**Streak reset** (evaluated in device local time at each log):
```ts
function toLocalISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
// Use toLocalISODate(new Date()) everywhere a "today" date string is needed.
// Never use toLocaleDateString or toISOString (which returns UTC).
```
- Same day as `lastLogDate` → no streak increment
- Yesterday → `streak += 1`
- Older or null → `streak = 1`

**Level formula note:** `level = Math.floor(loggedDates.length / 30) + 1` is based on total distinct days ever logged (not consecutive). A user who logs 60 non-consecutive days is Level 3. This is intentional — level rewards total cumulative effort, while streak rewards consistency. The StatsScreen should display a brief tooltip or subtitle clarifying this (e.g., "المستوى يرتفع بكل ٣٠ يوم من القضاء").

### Action Semantics

**`logPrayer(prayer)`:**
1. Cap check: if `prayers[prayer].recovered >= totalMissedDays`, do nothing (button is disabled in UI).
2. `prayers[prayer].recovered += 1`
3. Points: `points += 10` (no daily cap — users can accumulate points freely per prayer)
4. Mark `todayPrayers[prayer] = true`; set `todayDate = today`
5. Update streak + `lastLogDate`. Add today to `loggedDates` only if not already present: `if (!loggedDates.includes(today)) loggedDates.push(today)`
6. Run badge checks → append new badges to `badges[]`
7. Run confetti checks

**`logFullDay()`:**
1. For each of the 5 prayers: if `recovered < totalMissedDays`, increment by 1
2. Mark all 5 keys in `todayPrayers`; set `todayDate = today`
3. Points: `points += 100` (flat; does NOT call `logPrayer` internally to avoid double-counting)
4. Update streak + `lastLogDate`. Add today to `loggedDates` only if not already present: `if (!loggedDates.includes(today)) loggedDates.push(today)`
5. Run badge checks → append new badges
6. Run confetti checks

**`TodayBanner` count**: `Object.keys(todayPrayers).length` (max 5). On every app load and on every log action, if `todayDate !== today`, reset `todayPrayers = {}` and `todayDate = today` before proceeding.

**`resetAll()`:** Reset state to initial values:
```ts
{ wizardComplete: false, age: 0, pubertyAge: 0, periods: [], totalMissedDays: 0,
  prayers: { fajr: {recovered:0}, dhuhr: {recovered:0}, asr: {recovered:0},
             maghrib: {recovered:0}, isha: {recovered:0} },
  todayPrayers: {}, todayDate: null,
  streak: 0, lastLogDate: null, loggedDates: [], points: 0, badges: [],
  language: 'ar', notificationTime: null, notificationPermission: 'default' }
```
Zustand `persist` will overwrite LocalStorage on the next state update after reset.

**`exportBackup()`:** Serialize the full persisted state (all fields except action functions) to JSON. Create an `<a href="data:...">` element, set `download="qadaa-backup-YYYY-MM-DD.json"`, click it programmatically. The exported JSON has the same shape as `AppState` minus actions.

**`importBackup(json)`:**
- Parse JSON; validate presence of these required top-level keys: `wizardComplete`, `age`, `pubertyAge`, `periods`, `totalMissedDays`, `prayers`, `streak`, `lastLogDate`, `loggedDates`, `points`, `badges`, `language`
- On failure (parse error or missing key): return `false`, show error toast — do NOT partially update state
- On success: replace entire state with imported values, return `true`

---

## Screen Behaviour

### WizardScreen (`/wizard`)

Three steps with a step progress indicator (dots or numbered bar):

**Step 1 — Basic Info**
- Age input (integer, min 10, max 120)
- Puberty age input (integer, min 5, max `age - 1`)
- Validation inline; Next button disabled until valid

**Step 2 — Prayer Timeline**
- **Quick mode (default):** Single numeric input "كم سنة لم تصلِّ؟" (How many years did you not pray?). Maps to a single `PrayerPeriod { type: 'missed', years: value }`.
- **Advanced toggle:** Replaces the single input with a dynamic list of period rows. Each row: type selector (missed / regular) + years input. User can add/remove rows. Minimum 1 row.
- Live preview below input(s): "إجمالي الأيام المقضية: ١٨٢٥ يوم" — recalculates on every change.
- Validation: all years must be > 0; at least one `missed` period must exist (else totalMissedDays = 0, warn user).
- If `totalMissedDays` would be 0 on Next, show inline warning and block navigation.

**Step 3 — Confirmation**
- Shows: age, puberty age, total missed days, total missed prayers (× 5)
- Confirm button → `completeWizard()` → navigate to `/dashboard`

### DashboardScreen (`/dashboard`)

Layout (RTL, vertical scroll):

1. **Header bar:** "قضاء" logo left · `StreakBadge` right (flame emoji + streak number + "Lvl N" pill)
2. **TodayBanner:** Green gradient card. "اليوم — X من ٥" where X = prayers logged today (max 5). Progress bar fills proportionally.
3. **5 × PrayerRow** (Fajr → Isha order):
   - Prayer name (translated)
   - `recovered / totalMissedDays` count label
   - Circular SVG progress ring: emerald-700 fill when ≥ 50%, amber-500 when < 50%
   - `+1` button: large (min 44px), disabled + grey when `recovered >= totalMissedDays`
4. **"تسجيل يوم كامل" sticky button** at bottom of scroll area → `logFullDay()`

**Bottom navigation bar** (fixed, appears on all three main screens — Dashboard, Stats, Settings):
- 3 tabs: Dashboard (🏠), Stats (📊), Settings (⚙️)
- Active tab: filled icon + emerald-700 text label below icon
- Inactive tab: muted icon (slate-500), no label or greyed label
- Tab icons are emoji (no external icon library needed)

**Confetti triggers** (fire `confetti.fireConfetti()`):
- First ever log: `badges` array now contains `first_log` (checked after badge update)
- 7-day streak reached: `streak === 7`
- 30-day streak reached: `streak === 30`
- Any prayer crossing 25%, 50%, 75%, 100%: check if any new badge in `['quarter_way','halfway','almost_there','complete']` was just added

### StatsScreen (`/stats`)

1. **Streak + Level card** (prominent, top): large flame + streak number, level badge
2. **Points + Rank:** total points, rank label
   - Bronze: 0–499 pts · Silver: 500–1999 pts · Gold: 2000–4999 pts · Platinum: ≥ 5000 pts
3. **Badges grid (2 columns):**
   - Unlocked: coloured icon (emoji) + Arabic name + unlock date (formatted in locale)
   - Locked: greyscale icon + Arabic name (no date)

**Badge definitions:**

| ID | Arabic Name | Icon (emoji) | Unlock Condition |
|---|---|---|---|
| `first_log` | أول خطوة | 🌱 | First prayer logged |
| `first_week` | أسبوع مبارك | 🔥 | 7-day streak |
| `warrior_30` | مجاهد ٣٠ | ⚔️ | 30-day streak |
| `golden_year` | سنة ذهبية | 🌟 | 365-day streak |
| `quarter_way` | ربع الطريق | 🎯 | Any prayer ≥ 25% complete |
| `halfway` | منتصف الطريق | 🏃 | Any prayer ≥ 50% complete |
| `almost_there` | اقتربت | 🏅 | Any prayer ≥ 75% complete |
| `complete` | أتممت فريضة | 🏆 | Any single prayer = 100% complete |

(`complete` unlocks when the *first* prayer hits 100%, not all five.)

### SettingsScreen (`/settings`)

1. **Language toggle:** AR / EN pill toggle. On change: `setLanguage()` → `i18next.changeLanguage()` → `document.documentElement.lang`. The `dir` attribute **always stays `rtl`** — the app layout is RTL-first and English content reads acceptably in RTL. No layout flip occurs on language switch.
2. **Daily reminder:** `<input type="time">` field. On save button click: call `Notification.requestPermission()`. If granted: `setNotificationTime(value)`, store `notificationPermission: 'granted'`. If denied: show informational message "يرجى السماح بالإشعارات في إعدادات المتصفح", do NOT save time. If already granted (cached in store), skip the permission prompt and save directly.
3. **Export backup:** Button → `exportBackup()` → downloads `qadaa-backup-YYYY-MM-DD.json`.
4. **Import backup:** `<input type="file" accept=".json">` → reads file → `importBackup(json)`. On failure: show Arabic/English error toast.
5. **Reset wizard:** Destructive action with confirmation dialog → `resetAll()` → navigate to `/wizard`.

---

## Gamification Engine

### Streak Logic
```
On logPrayer or logFullDay:
  today = local ISO date string

  if lastLogDate === today:
    // already counted today — no streak change
  else if lastLogDate === yesterday:
    streak += 1
    lastLogDate = today
  else:
    streak = 1
    lastLogDate = today

  if today not in loggedDates:
    loggedDates.push(today)
```

### Badge Check (run after every log action)
```ts
function checkBadges(state: AppState): Badge[] {
  const newBadges: Badge[] = []
  const existingIds = new Set(state.badges.map(b => b.id))
  const now = Date.now()
  const maxProgress = (key: PrayerKey) =>
    (state.prayers[key].recovered / state.totalMissedDays) * 100

  if (!existingIds.has('first_log') && state.points > 0)
    newBadges.push({ id: 'first_log', unlockedAt: now })
  if (!existingIds.has('first_week') && state.streak >= 7)
    newBadges.push({ id: 'first_week', unlockedAt: now })
  if (!existingIds.has('warrior_30') && state.streak >= 30)
    newBadges.push({ id: 'warrior_30', unlockedAt: now })
  if (!existingIds.has('golden_year') && state.streak >= 365)
    newBadges.push({ id: 'golden_year', unlockedAt: now })

  // Progress badges: checked per-prayer independently.
  // "best" = the highest progress % among all 5 prayers.
  // A badge unlocks as soon as ANY single prayer crosses the threshold.
  // Each prayer has its own recovered counter; recovered is capped at totalMissedDays per prayer.
  // So complete = any single prayer's recovered === totalMissedDays.
  const prayers: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  const best = Math.max(...prayers.map(maxProgress))  // 0–100, uses the most-recovered prayer
  if (!existingIds.has('quarter_way') && best >= 25)
    newBadges.push({ id: 'quarter_way', unlockedAt: now })
  if (!existingIds.has('halfway') && best >= 50)
    newBadges.push({ id: 'halfway', unlockedAt: now })
  if (!existingIds.has('almost_there') && best >= 75)
    newBadges.push({ id: 'almost_there', unlockedAt: now })
  if (!existingIds.has('complete') && best >= 100)
    newBadges.push({ id: 'complete', unlockedAt: now })

  return newBadges
}
```

---

## PWA Configuration

**`vite.config.ts`:**
- `@vitejs/plugin-react` + `VitePWA` plugin
- `registerType: 'autoUpdate'`
- Workbox `globPatterns` caches all `**/*.{js,css,html,png}` (excludes `woff2` from precache to avoid double-caching)
- Add Workbox **runtime** `CacheFirst` strategy matching `/fonts/` URL pattern for `woff2` files — this is the sole caching mechanism for fonts

**Manifest (`manifest.webmanifest`):**
```json
{
  "name": "قضاء",
  "short_name": "قضاء",
  "start_url": "/",
  "display": "standalone",
  "dir": "rtl",
  "lang": "ar",
  "theme_color": "#047857",
  "background_color": "#0f172a",
  "icons": [
    { "src": "/icons/icon-192.png",          "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png",          "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### PWA Notifications (Best-Effort, No Push Server)

Use the **Web Notifications API** triggered from the main thread on app load.

**In `main.tsx` on every app load:**
```ts
const { notificationTime, notificationPermission, language } = useStore.getState()
if (notificationTime && notificationPermission === 'granted') {
  const [hh, mm] = notificationTime.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hh, mm, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)  // schedule for tomorrow if past
  const ms = target.getTime() - now.getTime()
  setTimeout(() => {
    new Notification('قضاء', {
      body: language === 'ar' ? 'لا تنسَ قضاءك اليوم 🌙' : "Don't forget your Qadaa today 🌙",
      icon: '/icons/icon-192.png',
    })
  }, ms)
}
```

**Limitation (acknowledged):** The notification fires once per app session. If the app is not open at the scheduled time, the notification will not fire. This is inherent to the Web Notifications API without a push server and is an accepted trade-off for this PWA.

---

## i18n Structure

Default language: `ar`. Namespace: `translation` (default i18next namespace).

**`src/locales/ar.json` key structure (partial example):**
```json
{
  "app": { "name": "قضاء" },
  "prayers": {
    "fajr": "الفجر",
    "dhuhr": "الظهر",
    "asr": "العصر",
    "maghrib": "المغرب",
    "isha": "العشاء"
  },
  "wizard": {
    "step1Title": "معلوماتك",
    "ageLabel": "عمرك الحالي",
    "pubertyAgeLabel": "عمر البلوغ",
    "step2Title": "سنوات الفوائت",
    "yearsLabel": "كم سنة لم تصلِّ؟",
    "advancedToggle": "وضع متقدم",
    "totalMissed": "إجمالي الأيام المقضية",
    "step3Title": "ملخص",
    "confirm": "ابدأ الرحلة"
  },
  "dashboard": {
    "today": "اليوم",
    "logFullDay": "تسجيل يوم كامل",
    "recovered": "مُقضي",
    "of": "من"
  },
  "stats": {
    "title": "إحصائياتك",
    "streak": "سلسلة الأيام",
    "level": "المستوى",
    "points": "النقاط",
    "badges": "الشارات",
    "ranks": {
      "bronze": "برونزي",
      "silver": "فضي",
      "gold": "ذهبي",
      "platinum": "بلاتيني"
    }
  },
  "settings": {
    "title": "الإعدادات",
    "language": "اللغة",
    "notification": "تذكير يومي",
    "export": "تصدير النسخة الاحتياطية",
    "import": "استيراد النسخة الاحتياطية",
    "reset": "إعادة الإعداد",
    "resetConfirm": "هل أنت متأكد؟ سيتم حذف جميع بياناتك."
  },
  "errors": {
    "importFailed": "فشل استيراد الملف. تأكد من صحة الملف.",
    "zeroDays": "يجب أن تكون هناك فترة فوائت واحدة على الأقل."
  }
}
```

`en.json` mirrors the same key structure in English.

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Primary | `#047857` (emerald-700) | Progress fills, CTAs, success states |
| Background | `#0f172a` (slate-900) | Page background |
| Surface | `#1e293b` (slate-800) | Cards, rows |
| Surface-2 | `#334155` (slate-700) | Borders, dividers |
| Gold | `#f59e0b` (amber-500) | Points, streak, badges |
| Text-primary | `#f1f5f9` (slate-100) | Main text |
| Text-muted | `#64748b` (slate-500) | Secondary labels |
| Font | Tajawal (self-hosted) | All text, AR + EN |
| Min button height | 44px | All interactive elements |
| Border radius | 8–12px | Cards and buttons |

All custom colors are defined as CSS variables in `tailwind.css` using Tailwind v4's `@theme` block — no config file needed.

---

## Verification

1. `npm run dev` → app opens, redirects to `/wizard` on first run (no data in LocalStorage).
2. Complete wizard (quick mode, 2 missed years) → `/dashboard` shows `730` as `totalMissedDays`, all prayers show `0 / 730`.
3. Tap `+1` on Fajr → recovered becomes `1 / 730`, progress ring updates, streak = 1, points = 10.
4. Tap "Log Full Day" → all 5 prayers increment, points = 110, confetti fires.
5. Tap `+1` on Fajr again same session → recovered increments again (same day, no streak change but points add: now 120).
6. `/stats` → streak = 1, level = 1, points = 120, `first_log` badge unlocked.
7. Settings → toggle to English → all UI text switches to English, `dir` stays `rtl`.
8. Settings → export → `qadaa-backup-YYYY-MM-DD.json` downloads with correct state.
9. Settings → reset → confirm dialog → state clears → redirects to `/wizard`.
10. Import the exported file → state restores, `/dashboard` shows same counts as before reset.
11. Settings → set notification time → browser prompts for notification permission.
12. `npm run build` → `dist/` contains `manifest.webmanifest`, `sw.js`, font files.
13. Serve `dist/` with `npx serve dist` → Lighthouse PWA audit ≥ 90, installable prompt appears, maskable icon passes.
14. Disable network in DevTools → reload → app loads fully from SW cache, fonts render correctly.
