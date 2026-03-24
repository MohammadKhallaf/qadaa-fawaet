# Qadaa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Qadaa (قضاء) PWA — a gamified, Arabic-first prayer recovery tracker — from zero to installable, offline-capable app.

**Architecture:** Vite + React 19 SPA, client-side only. Zustand with `persist` middleware stores all state in LocalStorage. React Router v7 (data router) handles 4 screens. `vite-plugin-pwa` + Workbox delivers offline support and installability.

**Tech Stack:** Vite 8, React 19, React Router 7, Tailwind CSS 4, Zustand 5, Motion (motion/react), react-i18next, canvas-confetti, vite-plugin-pwa, TypeScript 5

---

## File Map

```
qadaa/
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── icon-512-maskable.png
│   └── fonts/tajawal/            # woff2 files (downloaded in Task 1)
├── src/
│   ├── main.tsx                  # Task 2 — React root, i18n init, notification scheduler
│   ├── App.tsx                   # Task 2 — Router setup
│   ├── i18n.ts                   # Task 3 — i18next config
│   ├── store/
│   │   └── store.ts              # Task 4 — Zustand store (all state + actions)
│   ├── screens/
│   │   ├── WizardScreen.tsx      # Task 5
│   │   ├── DashboardScreen.tsx   # Task 6
│   │   ├── StatsScreen.tsx       # Task 7
│   │   └── SettingsScreen.tsx    # Task 8
│   ├── components/
│   │   ├── PrayerRow.tsx         # Task 6
│   │   ├── TodayBanner.tsx       # Task 6
│   │   ├── StreakBadge.tsx       # Task 6
│   │   ├── BadgeCard.tsx         # Task 7
│   │   └── confetti.ts           # Task 6
│   ├── hooks/
│   │   └── useStreak.ts          # Task 4
│   └── locales/
│       ├── ar.json               # Task 3
│       └── en.json               # Task 3
├── tailwind.css                  # Task 1
├── vite.config.ts                # Task 1 + Task 9
└── index.html                    # Task 1
```

---

## Task 1: Scaffold project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `tailwind.css`
- Create: `src/main.tsx` (stub)
- Create: `src/App.tsx` (stub)
- Download: `public/fonts/tajawal/*.woff2`

- [ ] **Step 1: Init project with Vite**

```bash
cd /home/mohammed-khallaf/projects/qadaa
npm create vite@latest . -- --template react-ts
```

Expected: scaffolds `src/`, `index.html`, `tsconfig.json`, `vite.config.ts`, `package.json`.

- [ ] **Step 2: Install all dependencies**

```bash
npm install react-router zustand motion react-i18next i18next canvas-confetti
npm install -D tailwindcss @tailwindcss/vite vite-plugin-pwa @types/canvas-confetti
```

- [ ] **Step 3: Configure Vite**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'قضاء',
        short_name: 'قضاء',
        start_url: '/',
        display: 'standalone',
        dir: 'rtl',
        lang: 'ar',
        theme_color: '#047857',
        background_color: '#0f172a',
        icons: [
          { src: '/icons/icon-192.png',          sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png',          sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png}'],
        runtimeCaching: [
          {
            urlPattern: /\/fonts\/.+\.woff2$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
```

- [ ] **Step 4: Create `tailwind.css`**

```css
@import "tailwindcss";

@theme {
  --color-primary: #047857;
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-surface2: #334155;
  --color-gold: #f59e0b;
  --color-text: #f1f5f9;
  --color-muted: #64748b;
  --font-family-sans: 'Tajawal', sans-serif;
}

@font-face {
  font-family: 'Tajawal';
  src: url('/fonts/tajawal/Tajawal-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Tajawal';
  src: url('/fonts/tajawal/Tajawal-Medium.woff2') format('woff2');
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: 'Tajawal';
  src: url('/fonts/tajawal/Tajawal-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
```

- [ ] **Step 5: Update `index.html`**

```html
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/icons/icon-192.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#047857" />
    <title>قضاء</title>
  </head>
  <body class="bg-[#0f172a] text-[#f1f5f9] font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Download Tajawal font files**

```bash
mkdir -p public/fonts/tajawal
cd public/fonts/tajawal
curl -L "https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1l8KiHrZjiA.woff2" -o Tajawal-Regular.woff2
curl -L "https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l5qjHrZjiA.woff2" -o Tajawal-Medium.woff2
curl -L "https://fonts.gstatic.com/s/tajawal/v9/Iurb6YBj_oCad4k1l4qkHrRjiA.woff2" -o Tajawal-Bold.woff2
```

> **Note:** If these exact URLs are stale, visit https://fonts.google.com/specimen/Tajawal, click "Download family", and extract the woff2 files manually. Place them in `public/fonts/tajawal/` matching the names above.

- [ ] **Step 7: Create stub `src/main.tsx`**

```tsx
import './tailwind.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 8: Create stub `src/App.tsx`**

```tsx
export default function App() {
  return <div className="p-4 text-[#f1f5f9]">قضاء — loading</div>
}
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: dev server at http://localhost:5173, page shows "قضاء — loading" in Tajawal font, RTL layout.

- [ ] **Step 10: Generate placeholder PWA icons**

```bash
# Create minimal placeholder icons (solid emerald square) using ImageMagick
# If ImageMagick not available, create PNGs manually or use any 192×192 / 512×512 placeholder
mkdir -p public/icons
convert -size 192x192 xc:#047857 public/icons/icon-192.png 2>/dev/null || \
  node -e "
    const fs = require('fs');
    // 1×1 green PNG (placeholder — replace with real icon before shipping)
    const png1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==','base64');
    fs.writeFileSync('public/icons/icon-192.png', png1x1);
    fs.writeFileSync('public/icons/icon-512.png', png1x1);
    fs.writeFileSync('public/icons/icon-512-maskable.png', png1x1);
    console.log('Placeholder icons created');
  "
```

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React project with Tailwind v4, PWA config, Tajawal font"
```

---

## Task 2: Router + screen stubs

**Files:**
- Modify: `src/App.tsx`
- Create: `src/screens/WizardScreen.tsx` (stub)
- Create: `src/screens/DashboardScreen.tsx` (stub)
- Create: `src/screens/StatsScreen.tsx` (stub)
- Create: `src/screens/SettingsScreen.tsx` (stub)

- [ ] **Step 1: Create screen stubs**

```bash
mkdir -p src/screens
```

`src/screens/WizardScreen.tsx`:
```tsx
export default function WizardScreen() {
  return <div className="p-4">Wizard</div>
}
```

`src/screens/DashboardScreen.tsx`:
```tsx
export default function DashboardScreen() {
  return <div className="p-4">Dashboard</div>
}
```

`src/screens/StatsScreen.tsx`:
```tsx
export default function StatsScreen() {
  return <div className="p-4">Stats</div>
}
```

`src/screens/SettingsScreen.tsx`:
```tsx
export default function SettingsScreen() {
  return <div className="p-4">Settings</div>
}
```

- [ ] **Step 2: Wire up router in `src/App.tsx`**

```tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import WizardScreen from './screens/WizardScreen'
import DashboardScreen from './screens/DashboardScreen'
import StatsScreen from './screens/StatsScreen'
import SettingsScreen from './screens/SettingsScreen'

function RootRedirect() {
  // Will read from store in Task 4; hardcode to /wizard for now
  return <Navigate to="/wizard" replace />
}

function RequireWizard({ children }: { children: React.ReactNode }) {
  // Will guard with store in Task 4; pass-through for now
  return <>{children}</>
}

const router = createBrowserRouter([
  { path: '/',          element: <RootRedirect /> },
  { path: '/wizard',    element: <WizardScreen /> },
  { path: '/dashboard', element: <RequireWizard><DashboardScreen /></RequireWizard> },
  { path: '/stats',     element: <RequireWizard><StatsScreen /></RequireWizard> },
  { path: '/settings',  element: <SettingsScreen /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 3: Verify routing works**

```bash
npm run dev
```

Navigate to http://localhost:5173 — should redirect to `/wizard` and show "Wizard". Manually navigate to `/dashboard`, `/stats`, `/settings` — each should render its stub.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add React Router v7 with screen stubs and route guards"
```

---

## Task 3: i18n setup (AR + EN)

**Files:**
- Create: `src/i18n.ts`
- Create: `src/locales/ar.json`
- Create: `src/locales/en.json`
- Modify: `src/main.tsx`

- [ ] **Step 1: Create `src/locales/ar.json`**

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
    "addPeriod": "إضافة فترة",
    "removePeriod": "حذف",
    "periodMissed": "فوائت",
    "periodRegular": "منتظم",
    "totalMissed": "إجمالي الأيام المقضية",
    "step3Title": "ملخص",
    "totalPrayers": "إجمالي الصلوات المقضية",
    "confirm": "ابدأ الرحلة",
    "back": "رجوع",
    "next": "التالي",
    "zeroDaysWarning": "يجب أن تكون هناك فترة فوائت واحدة على الأقل."
  },
  "dashboard": {
    "today": "اليوم",
    "outOf": "من",
    "logFullDay": "تسجيل يوم كامل",
    "recovered": "مُقضي"
  },
  "stats": {
    "title": "إحصائياتك",
    "streak": "سلسلة الأيام",
    "level": "المستوى",
    "levelHint": "المستوى يرتفع بكل ٣٠ يوم",
    "points": "النقاط",
    "badges": "الشارات",
    "lockedBadge": "مغلق",
    "ranks": {
      "bronze": "برونزي",
      "silver": "فضي",
      "gold": "ذهبي",
      "platinum": "بلاتيني"
    },
    "badges_data": {
      "first_log": "أول خطوة",
      "first_week": "أسبوع مبارك",
      "warrior_30": "مجاهد ٣٠",
      "golden_year": "سنة ذهبية",
      "quarter_way": "ربع الطريق",
      "halfway": "منتصف الطريق",
      "almost_there": "اقتربت",
      "complete": "أتممت فريضة"
    }
  },
  "settings": {
    "title": "الإعدادات",
    "language": "اللغة",
    "ar": "العربية",
    "en": "English",
    "notification": "تذكير يومي",
    "notificationSave": "حفظ",
    "notificationDenied": "يرجى السماح بالإشعارات في إعدادات المتصفح",
    "export": "تصدير النسخة الاحتياطية",
    "import": "استيراد النسخة الاحتياطية",
    "reset": "إعادة الإعداد",
    "resetConfirm": "هل أنت متأكد؟ سيتم حذف جميع بياناتك.",
    "cancel": "إلغاء"
  },
  "nav": {
    "dashboard": "الرئيسية",
    "stats": "الإحصائيات",
    "settings": "الإعدادات"
  },
  "errors": {
    "importFailed": "فشل استيراد الملف. تأكد من صحة الملف."
  }
}
```

- [ ] **Step 2: Create `src/locales/en.json`**

```json
{
  "app": { "name": "Qadaa" },
  "prayers": {
    "fajr": "Fajr",
    "dhuhr": "Dhuhr",
    "asr": "Asr",
    "maghrib": "Maghrib",
    "isha": "Isha"
  },
  "wizard": {
    "step1Title": "Your Info",
    "ageLabel": "Your current age",
    "pubertyAgeLabel": "Age at puberty",
    "step2Title": "Missed Prayer Years",
    "yearsLabel": "How many years did you not pray?",
    "advancedToggle": "Advanced mode",
    "addPeriod": "Add period",
    "removePeriod": "Remove",
    "periodMissed": "Missed",
    "periodRegular": "Regular",
    "totalMissed": "Total missed days",
    "step3Title": "Summary",
    "totalPrayers": "Total missed prayers",
    "confirm": "Start the journey",
    "back": "Back",
    "next": "Next",
    "zeroDaysWarning": "At least one missed period is required."
  },
  "dashboard": {
    "today": "Today",
    "outOf": "of",
    "logFullDay": "Log Full Day",
    "recovered": "recovered"
  },
  "stats": {
    "title": "Your Stats",
    "streak": "Day Streak",
    "level": "Level",
    "levelHint": "Level increases every 30 days",
    "points": "Points",
    "badges": "Badges",
    "lockedBadge": "Locked",
    "ranks": {
      "bronze": "Bronze",
      "silver": "Silver",
      "gold": "Gold",
      "platinum": "Platinum"
    },
    "badges_data": {
      "first_log": "First Step",
      "first_week": "Blessed Week",
      "warrior_30": "30-Day Warrior",
      "golden_year": "Golden Year",
      "quarter_way": "Quarter Way",
      "halfway": "Halfway",
      "almost_there": "Almost There",
      "complete": "Prayer Complete"
    }
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "ar": "العربية",
    "en": "English",
    "notification": "Daily Reminder",
    "notificationSave": "Save",
    "notificationDenied": "Please allow notifications in browser settings",
    "export": "Export Backup",
    "import": "Import Backup",
    "reset": "Reset Wizard",
    "resetConfirm": "Are you sure? All your data will be deleted.",
    "cancel": "Cancel"
  },
  "nav": {
    "dashboard": "Home",
    "stats": "Stats",
    "settings": "Settings"
  },
  "errors": {
    "importFailed": "Failed to import file. Please check the file is valid."
  }
}
```

- [ ] **Step 3: Create `src/i18n.ts`**

```ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './locales/ar.json'
import en from './locales/en.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: { escapeValue: false },
  })

export default i18n
```

- [ ] **Step 4: Import i18n in `src/main.tsx`**

Add `import './i18n'` as the first import (before React):

```tsx
import './i18n'
import './tailwind.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 5: Verify i18n loads**

```bash
npm run dev
```

Open browser console. Run `window.i18next?.t('app.name')` — should return `"قضاء"`. No console errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add i18n with Arabic/English translations"
```

---

## Task 4: Zustand store

**Files:**
- Create: `src/store/store.ts`
- Create: `src/hooks/useStreak.ts`
- Modify: `src/App.tsx` (wire RootRedirect + RequireWizard to store)

- [ ] **Step 1: Install Zustand persist (already installed in Task 1; verify)**

```bash
npm ls zustand
```

Expected: `zustand@5.x.x`

- [ ] **Step 2: Create `src/store/store.ts`**

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'
export const PRAYER_KEYS: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

export interface PrayerPeriod {
  type: 'missed' | 'regular'
  years: number
}

export interface Badge {
  id: string
  unlockedAt: number
}

function toLocalISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function calcTotalMissedDays(periods: PrayerPeriod[]): number {
  return periods
    .filter(p => p.type === 'missed')
    .reduce((sum, p) => sum + Math.round(p.years * 365), 0)
}

const BADGE_DEFINITIONS = [
  { id: 'first_log',   check: (s: AppState) => s.points > 0 },
  { id: 'first_week',  check: (s: AppState) => s.streak >= 7 },
  { id: 'warrior_30',  check: (s: AppState) => s.streak >= 30 },
  { id: 'golden_year', check: (s: AppState) => s.streak >= 365 },
  { id: 'quarter_way', check: (s: AppState) => bestProgress(s) >= 25 },
  { id: 'halfway',     check: (s: AppState) => bestProgress(s) >= 50 },
  { id: 'almost_there',check: (s: AppState) => bestProgress(s) >= 75 },
  { id: 'complete',    check: (s: AppState) => bestProgress(s) >= 100 },
]

function bestProgress(s: AppState): number {
  if (s.totalMissedDays === 0) return 0
  return Math.max(...PRAYER_KEYS.map(k => (s.prayers[k].recovered / s.totalMissedDays) * 100))
}

function checkBadges(state: AppState): Badge[] {
  const existingIds = new Set(state.badges.map(b => b.id))
  const now = Date.now()
  return BADGE_DEFINITIONS
    .filter(def => !existingIds.has(def.id) && def.check(state))
    .map(def => ({ id: def.id, unlockedAt: now }))
}

// Confetti is fired imperatively from store actions
import { fireConfetti } from '../components/confetti'

function runConfettiChecks(prevBadgeIds: Set<string>, newState: AppState) {
  const newBadgeIds = new Set(newState.badges.map(b => b.id))
  const CONFETTI_BADGES = ['first_log', 'quarter_way', 'halfway', 'almost_there', 'complete']
  const hasNewConfettiBadge = CONFETTI_BADGES.some(id => !prevBadgeIds.has(id) && newBadgeIds.has(id))
  if (hasNewConfettiBadge) fireConfetti()
  if (!prevBadgeIds.has('first_week') && newBadgeIds.has('first_week')) fireConfetti()
  if (!prevBadgeIds.has('warrior_30') && newBadgeIds.has('warrior_30')) fireConfetti()
}

const initialPrayers = () =>
  Object.fromEntries(PRAYER_KEYS.map(k => [k, { recovered: 0 }])) as Record<PrayerKey, { recovered: number }>

export interface AppState {
  wizardComplete: boolean
  age: number
  pubertyAge: number
  periods: PrayerPeriod[]
  totalMissedDays: number
  prayers: Record<PrayerKey, { recovered: number }>
  todayPrayers: Partial<Record<PrayerKey, true>>
  todayDate: string | null
  streak: number
  lastLogDate: string | null
  loggedDates: string[]
  points: number
  badges: Badge[]
  language: 'ar' | 'en'
  notificationTime: string | null
  notificationPermission: 'default' | 'granted' | 'denied'

  completeWizard: (age: number, pubertyAge: number, periods: PrayerPeriod[]) => void
  logPrayer: (prayer: PrayerKey) => void
  logFullDay: () => void
  setLanguage: (lang: 'ar' | 'en') => void
  setNotificationTime: (time: string | null) => void
  setNotificationPermission: (p: 'default' | 'granted' | 'denied') => void
  resetAll: () => void
  exportBackup: () => void
  importBackup: (json: string) => boolean
}

function updateStreak(state: Pick<AppState, 'streak' | 'lastLogDate' | 'loggedDates'>) {
  const today = toLocalISODate(new Date())
  const yesterday = toLocalISODate(new Date(Date.now() - 86400000))
  let streak = state.streak
  if (state.lastLogDate === today) {
    // no streak change
  } else if (state.lastLogDate === yesterday) {
    streak += 1
  } else {
    streak = 1
  }
  const loggedDates = state.loggedDates.includes(today)
    ? state.loggedDates
    : [...state.loggedDates, today]
  return { streak, lastLogDate: today, loggedDates }
}

function resetTodayIfNeeded(state: Pick<AppState, 'todayDate' | 'todayPrayers'>): Partial<AppState> {
  const today = toLocalISODate(new Date())
  if (state.todayDate !== today) {
    return { todayPrayers: {}, todayDate: today }
  }
  return {}
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      wizardComplete: false,
      age: 0,
      pubertyAge: 0,
      periods: [],
      totalMissedDays: 0,
      prayers: initialPrayers(),
      todayPrayers: {},
      todayDate: null,
      streak: 0,
      lastLogDate: null,
      loggedDates: [],
      points: 0,
      badges: [],
      language: 'ar',
      notificationTime: null,
      notificationPermission: 'default',

      completeWizard: (age, pubertyAge, periods) => {
        set({
          wizardComplete: true,
          age,
          pubertyAge,
          periods,
          totalMissedDays: calcTotalMissedDays(periods),
        })
      },

      logPrayer: (prayer) => {
        const state = get()
        const todayReset = resetTodayIfNeeded(state)
        const prayers = { ...state.prayers }
        if (prayers[prayer].recovered >= state.totalMissedDays) return
        prayers[prayer] = { recovered: prayers[prayer].recovered + 1 }
        const todayPrayers = { ...(todayReset.todayPrayers ?? state.todayPrayers), [prayer]: true as const }
        const points = state.points + 10
        const streakUpdate = updateStreak(state)
        const prevBadgeIds = new Set(state.badges.map(b => b.id))
        const partialState = { ...state, ...todayReset, prayers, todayPrayers, points, ...streakUpdate }
        const newBadges = checkBadges(partialState as AppState)
        const badges = [...state.badges, ...newBadges]
        set({ ...todayReset, prayers, todayPrayers, points, ...streakUpdate, badges })
        runConfettiChecks(prevBadgeIds, { ...partialState, badges } as AppState)
      },

      logFullDay: () => {
        const state = get()
        const todayReset = resetTodayIfNeeded(state)
        const prayers = { ...state.prayers }
        PRAYER_KEYS.forEach(k => {
          if (prayers[k].recovered < state.totalMissedDays) {
            prayers[k] = { recovered: prayers[k].recovered + 1 }
          }
        })
        const todayPrayers: Partial<Record<PrayerKey, true>> = Object.fromEntries(PRAYER_KEYS.map(k => [k, true]))
        const points = state.points + 100
        const streakUpdate = updateStreak(state)
        const prevBadgeIds = new Set(state.badges.map(b => b.id))
        const partialState = { ...state, ...todayReset, prayers, todayPrayers, points, ...streakUpdate }
        const newBadges = checkBadges(partialState as AppState)
        const badges = [...state.badges, ...newBadges]
        set({ ...todayReset, prayers, todayPrayers, points, ...streakUpdate, badges })
        runConfettiChecks(prevBadgeIds, { ...partialState, badges } as AppState)
      },

      setLanguage: (language) => {
        set({ language })
      },

      setNotificationTime: (notificationTime) => {
        set({ notificationTime })
      },

      setNotificationPermission: (notificationPermission) => {
        set({ notificationPermission })
      },

      resetAll: () => {
        set({
          wizardComplete: false, age: 0, pubertyAge: 0, periods: [], totalMissedDays: 0,
          prayers: initialPrayers(), todayPrayers: {}, todayDate: null,
          streak: 0, lastLogDate: null, loggedDates: [], points: 0, badges: [],
          language: 'ar', notificationTime: null, notificationPermission: 'default',
        })
      },

      exportBackup: () => {
        const state = get()
        const backup = {
          wizardComplete: state.wizardComplete, age: state.age, pubertyAge: state.pubertyAge,
          periods: state.periods, totalMissedDays: state.totalMissedDays, prayers: state.prayers,
          todayPrayers: state.todayPrayers, todayDate: state.todayDate,
          streak: state.streak, lastLogDate: state.lastLogDate, loggedDates: state.loggedDates,
          points: state.points, badges: state.badges, language: state.language,
          notificationTime: state.notificationTime, notificationPermission: state.notificationPermission,
        }
        const json = JSON.stringify(backup, null, 2)
        const date = toLocalISODate(new Date())
        const a = document.createElement('a')
        a.href = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`
        a.download = `qadaa-backup-${date}.json`
        a.click()
      },

      importBackup: (json) => {
        try {
          const data = JSON.parse(json)
          const required = ['wizardComplete','age','pubertyAge','periods','totalMissedDays',
            'prayers','streak','lastLogDate','loggedDates','points','badges','language']
          if (!required.every(k => k in data)) return false
          set(data)
          return true
        } catch {
          return false
        }
      },
    }),
    {
      name: 'qadaa-store',
      partialize: (state) => {
        // Persist everything except actions
        const { completeWizard, logPrayer, logFullDay, setLanguage, setNotificationTime,
          setNotificationPermission, resetAll, exportBackup, importBackup, ...rest } = state
        return rest
      },
    }
  )
)
```

- [ ] **Step 3: Create `src/components/confetti.ts`**

```bash
mkdir -p src/components
```

```ts
import confetti from 'canvas-confetti'

export function fireConfetti(): void {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#047857', '#f59e0b', '#34d399', '#fbbf24'],
  })
}
```

- [ ] **Step 4: Create `src/hooks/useStreak.ts`**

```bash
mkdir -p src/hooks
```

```ts
import { useStore } from '../store/store'

function toLocalISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function useStreak(): { streak: number; isAtRisk: boolean } {
  const streak = useStore(s => s.streak)
  const lastLogDate = useStore(s => s.lastLogDate)
  const yesterday = toLocalISODate(new Date(Date.now() - 86400000))
  const isAtRisk = lastLogDate === yesterday  // logged yesterday but not today
  return { streak, isAtRisk }
}
```

- [ ] **Step 5: Wire RootRedirect + RequireWizard to store in `src/App.tsx`**

Update the two guard components:

```tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import { useStore } from './store/store'
import WizardScreen from './screens/WizardScreen'
import DashboardScreen from './screens/DashboardScreen'
import StatsScreen from './screens/StatsScreen'
import SettingsScreen from './screens/SettingsScreen'

function RootRedirect() {
  const wizardComplete = useStore(s => s.wizardComplete)
  return <Navigate to={wizardComplete ? '/dashboard' : '/wizard'} replace />
}

function RequireWizard({ children }: { children: React.ReactNode }) {
  const wizardComplete = useStore(s => s.wizardComplete)
  if (!wizardComplete) return <Navigate to="/wizard" replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  { path: '/',          element: <RootRedirect /> },
  { path: '/wizard',    element: <WizardScreen /> },
  { path: '/dashboard', element: <RequireWizard><DashboardScreen /></RequireWizard> },
  { path: '/stats',     element: <RequireWizard><StatsScreen /></RequireWizard> },
  { path: '/settings',  element: <SettingsScreen /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
```

- [ ] **Step 6: Verify store works**

```bash
npm run dev
```

Open browser DevTools console. Run:
```js
// Access store directly
const state = window.__zustand_store__  // or check via React DevTools
```

Navigate to `/wizard` → app shows stub. Open LocalStorage in DevTools — should see `qadaa-store` key after first render.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Zustand store with full state model, actions, badge engine, confetti"
```

---

## Task 5: WizardScreen

**Files:**
- Modify: `src/screens/WizardScreen.tsx`

The wizard has 3 steps. All in one file — it's self-contained.

- [ ] **Step 1: Implement WizardScreen**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useStore, PrayerPeriod, PRAYER_KEYS } from '../store/store'
import { motion, AnimatePresence } from 'motion/react'

function calcMissedDays(periods: PrayerPeriod[]): number {
  return periods
    .filter(p => p.type === 'missed')
    .reduce((sum, p) => sum + Math.round(p.years * 365), 0)
}

export default function WizardScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { wizardComplete, completeWizard } = useStore()

  const [step, setStep] = useState(1)

  // Redirect if wizard already complete (avoids side-effect in render body)
  React.useEffect(() => {
    if (wizardComplete) navigate('/dashboard', { replace: true })
  }, [wizardComplete, navigate])

  const [age, setAge] = useState('')
  const [pubertyAge, setPubertyAge] = useState('')
  const [advanced, setAdvanced] = useState(false)
  const [quickYears, setQuickYears] = useState('')
  const [periods, setPeriods] = useState<PrayerPeriod[]>([{ type: 'missed', years: 0 }])

  const activePeriods: PrayerPeriod[] = advanced
    ? periods
    : quickYears ? [{ type: 'missed', years: parseFloat(quickYears) }] : []

  const totalMissedDays = calcMissedDays(activePeriods)
  const ageNum = parseInt(age)
  const pubertyAgeNum = parseInt(pubertyAge)

  const step1Valid = ageNum >= 10 && ageNum <= 120 && pubertyAgeNum >= 5 && pubertyAgeNum < ageNum
  const step2Valid = totalMissedDays > 0

  function handleConfirm() {
    completeWizard(ageNum, pubertyAgeNum, activePeriods)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6">
      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {[1,2,3].map(s => (
          <div key={s} className={`w-3 h-3 rounded-full transition-colors ${s === step ? 'bg-[#047857]' : s < step ? 'bg-[#34d399]' : 'bg-[#334155]'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#f1f5f9]">{t('wizard.step1Title')}</h2>
            <div>
              <label className="block text-sm text-[#64748b] mb-1">{t('wizard.ageLabel')}</label>
              <input type="number" min={10} max={120} value={age} onChange={e => setAge(e.target.value)}
                className="w-full bg-[#1e293b] text-[#f1f5f9] rounded-lg px-4 py-3 text-lg outline-none border border-[#334155] focus:border-[#047857]" />
            </div>
            <div>
              <label className="block text-sm text-[#64748b] mb-1">{t('wizard.pubertyAgeLabel')}</label>
              <input type="number" min={5} max={ageNum - 1 || 119} value={pubertyAge} onChange={e => setPubertyAge(e.target.value)}
                className="w-full bg-[#1e293b] text-[#f1f5f9] rounded-lg px-4 py-3 text-lg outline-none border border-[#334155] focus:border-[#047857]" />
            </div>
            <button disabled={!step1Valid} onClick={() => setStep(2)}
              className="w-full py-4 rounded-xl font-bold text-lg bg-[#047857] text-white disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]">
              {t('wizard.next')}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#f1f5f9]">{t('wizard.step2Title')}</h2>
            {!advanced ? (
              <div>
                <label className="block text-sm text-[#64748b] mb-1">{t('wizard.yearsLabel')}</label>
                <input type="number" min={0.5} max={99} step={0.5} value={quickYears} onChange={e => setQuickYears(e.target.value)}
                  className="w-full bg-[#1e293b] text-[#f1f5f9] rounded-lg px-4 py-3 text-lg outline-none border border-[#334155] focus:border-[#047857]" />
              </div>
            ) : (
              <div className="space-y-3">
                {periods.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select value={p.type} onChange={e => {
                        const np = [...periods]; np[i] = { ...p, type: e.target.value as 'missed'|'regular' }; setPeriods(np)
                      }} className="bg-[#1e293b] text-[#f1f5f9] rounded-lg px-3 py-2 border border-[#334155]">
                      <option value="missed">{t('wizard.periodMissed')}</option>
                      <option value="regular">{t('wizard.periodRegular')}</option>
                    </select>
                    <input type="number" min={0.5} max={99} step={0.5} value={p.years || ''} onChange={e => {
                        const np = [...periods]; np[i] = { ...p, years: parseFloat(e.target.value) || 0 }; setPeriods(np)
                      }} className="flex-1 bg-[#1e293b] text-[#f1f5f9] rounded-lg px-3 py-2 border border-[#334155]" placeholder="سنوات" />
                    {periods.length > 1 && (
                      <button onClick={() => setPeriods(periods.filter((_, j) => j !== i))}
                        className="text-[#f87171] text-sm px-2 min-h-[44px]">{t('wizard.removePeriod')}</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setPeriods([...periods, { type: 'missed', years: 0 }])}
                  className="text-[#047857] text-sm min-h-[44px]">+ {t('wizard.addPeriod')}</button>
              </div>
            )}
            <button onClick={() => setAdvanced(!advanced)} className="text-sm text-[#64748b] underline min-h-[44px]">
              {t('wizard.advancedToggle')}
            </button>
            <div className="bg-[#1e293b] rounded-xl p-4">
              <p className="text-sm text-[#64748b]">{t('wizard.totalMissed')}</p>
              <p className="text-3xl font-bold text-[#047857]">{totalMissedDays.toLocaleString('ar-EG')}</p>
            </div>
            {!step2Valid && (quickYears || advanced) && (
              <p className="text-[#f87171] text-sm">{t('wizard.zeroDaysWarning')}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl border border-[#334155] text-[#f1f5f9] min-h-[44px]">
                {t('wizard.back')}
              </button>
              <button disabled={!step2Valid} onClick={() => setStep(3)}
                className="flex-1 py-4 rounded-xl font-bold bg-[#047857] text-white disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]">
                {t('wizard.next')}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#f1f5f9]">{t('wizard.step3Title')}</h2>
            <div className="bg-[#1e293b] rounded-xl p-4 space-y-3">
              <div className="flex justify-between"><span className="text-[#64748b]">{t('wizard.ageLabel')}</span><span className="text-[#f1f5f9] font-bold">{age}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">{t('wizard.pubertyAgeLabel')}</span><span className="text-[#f1f5f9] font-bold">{pubertyAge}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">{t('wizard.totalMissed')}</span><span className="text-[#047857] font-bold text-xl">{totalMissedDays.toLocaleString('ar-EG')}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">{t('wizard.totalPrayers')}</span><span className="text-[#f59e0b] font-bold text-xl">{(totalMissedDays * 5).toLocaleString('ar-EG')}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-xl border border-[#334155] text-[#f1f5f9] min-h-[44px]">
                {t('wizard.back')}
              </button>
              <button onClick={handleConfirm} className="flex-1 py-4 rounded-xl font-bold bg-[#047857] text-white min-h-[44px]">
                {t('wizard.confirm')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: Test wizard flow manually**

```bash
npm run dev
```

1. Navigate to http://localhost:5173 → redirects to `/wizard`
2. Step 1: Enter age=30, puberty age=15 → Next enabled
3. Step 2: Enter 2 years → preview shows 730 days → Next enabled
4. Step 3: Summary shows 730 days, 3650 prayers → Confirm
5. Should redirect to `/dashboard` (stub)
6. Refresh page → stays on `/dashboard` (wizardComplete = true persisted)
7. Navigate to `/wizard` → redirects to `/dashboard`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: implement WizardScreen with 3-step flow and motion animations"
```

---

## Task 6: DashboardScreen + components

**Files:**
- Modify: `src/screens/DashboardScreen.tsx`
- Create: `src/components/PrayerRow.tsx`
- Create: `src/components/TodayBanner.tsx`
- Create: `src/components/StreakBadge.tsx`
- Create: `src/components/BottomNav.tsx`

- [ ] **Step 1: Create `src/components/StreakBadge.tsx`**

```tsx
import { useStreak } from '../hooks/useStreak'
import { useStore } from '../store/store'
import { useTranslation } from 'react-i18next'

export default function StreakBadge() {
  const { t } = useTranslation()
  const { streak, isAtRisk } = useStreak()
  const loggedDates = useStore(s => s.loggedDates)
  const level = Math.floor(loggedDates.length / 30) + 1

  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg ${isAtRisk ? 'animate-pulse' : ''}`}>🔥</span>
      <span className="text-[#f59e0b] font-bold">{streak}</span>
      <span className="bg-[#1e293b] text-[#64748b] text-xs px-2 py-1 rounded-full">{t('stats.level')} {level}</span>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/TodayBanner.tsx`**

```tsx
import { useStore } from '../store/store'
import { useTranslation } from 'react-i18next'

export default function TodayBanner() {
  const { t } = useTranslation()
  const todayPrayers = useStore(s => s.todayPrayers)
  const count = Object.keys(todayPrayers).length

  return (
    <div className="bg-gradient-to-r from-[#064e3b] to-[#065f46] rounded-2xl p-4 mx-4 mb-4">
      <p className="text-[#6ee7b7] text-sm mb-2">
        {t('dashboard.today')} — {count} {t('dashboard.outOf')} 5
      </p>
      <div className="bg-[#0f172a]/40 rounded-full h-2">
        <div
          className="bg-[#34d399] h-2 rounded-full transition-all duration-500"
          style={{ width: `${(count / 5) * 100}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/PrayerRow.tsx`**

```tsx
import { useStore, PrayerKey } from '../store/store'
import { useTranslation } from 'react-i18next'

interface Props {
  prayerKey: PrayerKey
}

// Circular SVG progress ring
function ProgressRing({ pct }: { pct: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 50 ? '#047857' : '#f59e0b'
  return (
    <svg width="44" height="44" className="-rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#334155" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      <text x="22" y="22" dominantBaseline="middle" textAnchor="middle"
        fill={color} fontSize="9" fontWeight="bold" className="rotate-90 origin-[22px_22px]">
        {Math.round(pct)}%
      </text>
    </svg>
  )
}

export default function PrayerRow({ prayerKey }: Props) {
  const { t } = useTranslation()
  const prayer = useStore(s => s.prayers[prayerKey])
  const totalMissedDays = useStore(s => s.totalMissedDays)
  const logPrayer = useStore(s => s.logPrayer)

  const pct = totalMissedDays > 0 ? Math.min((prayer.recovered / totalMissedDays) * 100, 100) : 0
  const isDone = prayer.recovered >= totalMissedDays

  return (
    <div className="flex items-center justify-between bg-[#1e293b] rounded-2xl px-4 py-3 mx-4 mb-3">
      <div>
        <p className="text-[#f1f5f9] font-medium">{t(`prayers.${prayerKey}`)}</p>
        <p className="text-[#64748b] text-xs mt-0.5">
          {prayer.recovered.toLocaleString()} / {totalMissedDays.toLocaleString()} {t('dashboard.recovered')}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ProgressRing pct={pct} />
        <button
          onClick={() => logPrayer(prayerKey)}
          disabled={isDone}
          className="w-11 h-11 rounded-xl bg-[#047857] text-white font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          +١
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/BottomNav.tsx`**

```tsx
import { useNavigate, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'

const tabs = [
  { path: '/dashboard', icon: '🏠', key: 'nav.dashboard' },
  { path: '/stats',     icon: '📊', key: 'nav.stats' },
  { path: '/settings',  icon: '⚙️',  key: 'nav.settings' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t border-[#334155] flex z-10">
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 min-h-[56px] transition-colors ${active ? 'text-[#047857]' : 'text-[#64748b]'}`}>
            <span className="text-xl">{tab.icon}</span>
            {active && <span className="text-[10px] font-bold">{t(tab.key)}</span>}
          </button>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 5: Implement `src/screens/DashboardScreen.tsx`**

```tsx
import { useStore, PRAYER_KEYS } from '../store/store'
import { useTranslation } from 'react-i18next'
import StreakBadge from '../components/StreakBadge'
import TodayBanner from '../components/TodayBanner'
import PrayerRow from '../components/PrayerRow'
import BottomNav from '../components/BottomNav'

export default function DashboardScreen() {
  const { t } = useTranslation()
  const logFullDay = useStore(s => s.logFullDay)
  const appName = t('app.name')

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">{appName}</h1>
        <StreakBadge />
      </div>

      {/* Today Banner */}
      <TodayBanner />

      {/* Prayer rows */}
      <div className="mb-4">
        {PRAYER_KEYS.map(key => (
          <PrayerRow key={key} prayerKey={key} />
        ))}
      </div>

      {/* Log full day — sticky above bottom nav */}
      <div className="fixed bottom-16 left-0 right-0 px-4 z-10">
        <button
          onClick={logFullDay}
          className="w-full py-4 rounded-2xl bg-[#047857] text-white font-bold text-lg shadow-lg active:scale-[0.98] transition-transform min-h-[56px]"
        >
          ✓ {t('dashboard.logFullDay')}
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 6: Test dashboard manually**

```bash
npm run dev
```

1. Complete wizard if not already done (or clear LocalStorage to reset)
2. Dashboard shows app name + streak badge + today banner + 5 prayer rows
3. Tap `+1` on Fajr → count increments, progress ring updates, today banner shows 1 of 5
4. Tap "Log Full Day" → all 5 prayers increment, today banner shows 5 of 5, confetti fires
5. Navigate between tabs via bottom nav

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: implement DashboardScreen with prayer rows, today banner, streak badge"
```

---

## Task 7: StatsScreen

**Files:**
- Modify: `src/screens/StatsScreen.tsx`
- Create: `src/components/BadgeCard.tsx`

- [ ] **Step 1: Create `src/components/BadgeCard.tsx`**

```tsx
import { useTranslation } from 'react-i18next'
import { Badge } from '../store/store'

const BADGE_ICONS: Record<string, string> = {
  first_log:   '🌱',
  first_week:  '🔥',
  warrior_30:  '⚔️',
  golden_year: '🌟',
  quarter_way: '🎯',
  halfway:     '🏃',
  almost_there:'🏅',
  complete:    '🏆',
}

const ALL_BADGE_IDS = Object.keys(BADGE_ICONS)

interface Props {
  badges: Badge[]
}

export default function BadgeGrid({ badges }: Props) {
  const { t } = useTranslation()
  const unlockedIds = new Set(badges.map(b => b.id))

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {ALL_BADGE_IDS.map(id => {
        const badge = badges.find(b => b.id === id)
        const unlocked = unlockedIds.has(id)
        return (
          <div key={id} className={`bg-[#1e293b] rounded-2xl p-4 flex flex-col items-center gap-2 ${unlocked ? '' : 'opacity-40'}`}>
            <span className="text-3xl">{BADGE_ICONS[id]}</span>
            <p className="text-sm font-medium text-[#f1f5f9] text-center">{t(`stats.badges_data.${id}`)}</p>
            {unlocked && badge && (
              <p className="text-[10px] text-[#64748b]">
                {new Date(badge.unlockedAt).toLocaleDateString('ar-EG')}
              </p>
            )}
            {!unlocked && (
              <p className="text-[10px] text-[#64748b]">{t('stats.lockedBadge')}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Implement `src/screens/StatsScreen.tsx`**

```tsx
import { useStore } from '../store/store'
import { useTranslation } from 'react-i18next'
import { useStreak } from '../hooks/useStreak'
import BadgeGrid from '../components/BadgeCard'
import BottomNav from '../components/BottomNav'

function getRank(points: number, t: (k: string) => string): string {
  if (points >= 5000) return t('stats.ranks.platinum')
  if (points >= 2000) return t('stats.ranks.gold')
  if (points >= 500)  return t('stats.ranks.silver')
  return t('stats.ranks.bronze')
}

export default function StatsScreen() {
  const { t } = useTranslation()
  const { streak } = useStreak()
  const points = useStore(s => s.points)
  const badges = useStore(s => s.badges)
  const loggedDates = useStore(s => s.loggedDates)
  const level = Math.floor(loggedDates.length / 30) + 1

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">{t('stats.title')}</h1>
      </div>

      {/* Streak + Level */}
      <div className="mx-4 mb-4 bg-[#1e293b] rounded-2xl p-6 flex justify-around">
        <div className="text-center">
          <p className="text-4xl">🔥</p>
          <p className="text-3xl font-bold text-[#f59e0b]">{streak}</p>
          <p className="text-xs text-[#64748b] mt-1">{t('stats.streak')}</p>
        </div>
        <div className="text-center">
          <p className="text-4xl">⭐</p>
          <p className="text-3xl font-bold text-[#047857]">{level}</p>
          <p className="text-xs text-[#64748b] mt-1">{t('stats.level')}</p>
          <p className="text-[10px] text-[#64748b]">{t('stats.levelHint')}</p>
        </div>
      </div>

      {/* Points + Rank */}
      <div className="mx-4 mb-4 bg-[#1e293b] rounded-2xl p-4 flex justify-between items-center">
        <div>
          <p className="text-[#64748b] text-sm">{t('stats.points')}</p>
          <p className="text-3xl font-bold text-[#f59e0b]">{points.toLocaleString()}</p>
        </div>
        <div className="bg-[#f59e0b]/10 px-4 py-2 rounded-xl">
          <p className="text-[#f59e0b] font-bold">{getRank(points, t)}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="px-4 mb-3">
        <h2 className="text-lg font-bold text-[#f1f5f9]">{t('stats.badges')}</h2>
      </div>
      <BadgeGrid badges={badges} />

      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 3: Test stats screen**

```bash
npm run dev
```

1. Complete wizard + log some prayers
2. Navigate to Stats via bottom nav
3. Streak, level, points display correctly
4. `first_log` badge shows as unlocked after first prayer logged
5. Other badges show as locked/greyed

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement StatsScreen with streak, level, points, badges"
```

---

## Task 8: SettingsScreen

**Files:**
- Modify: `src/screens/SettingsScreen.tsx`
- Modify: `src/main.tsx` (add notification scheduler)

- [ ] **Step 1: Implement `src/screens/SettingsScreen.tsx`**

```tsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/store'
import i18n from '../i18n'
import BottomNav from '../components/BottomNav'

export default function SettingsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { language, setLanguage, notificationTime, setNotificationTime,
    setNotificationPermission, notificationPermission, exportBackup, importBackup, resetAll } = useStore()

  const [notifValue, setNotifValue] = useState(notificationTime ?? '')
  const [notifMsg, setNotifMsg] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSaveNotification() {
    if (!notifValue) return
    let permission = notificationPermission
    if (permission !== 'granted') {
      const result = await Notification.requestPermission()
      permission = result as 'default' | 'granted' | 'denied'
      setNotificationPermission(permission)
    }
    if (permission === 'granted') {
      setNotificationTime(notifValue)
      setNotifMsg(null)
    } else {
      setNotifMsg(t('settings.notificationDenied'))
    }
  }

  function handleLanguage(lang: 'ar' | 'en') {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    document.documentElement.lang = lang
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const json = ev.target?.result as string
      const ok = importBackup(json)
      if (!ok) setImportError(t('errors.importFailed'))
      else setImportError(null)
    }
    reader.readAsText(file)
  }

  function handleReset() {
    resetAll()
    i18n.changeLanguage('ar')
    document.documentElement.lang = 'ar'
    navigate('/wizard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">{t('settings.title')}</h1>
      </div>

      <div className="space-y-4 px-4">
        {/* Language */}
        <div className="bg-[#1e293b] rounded-2xl p-4">
          <p className="text-[#64748b] text-sm mb-3">{t('settings.language')}</p>
          <div className="flex gap-2">
            {(['ar', 'en'] as const).map(lang => (
              <button key={lang} onClick={() => handleLanguage(lang)}
                className={`flex-1 py-2 rounded-xl font-medium text-sm min-h-[44px] transition-colors ${language === lang ? 'bg-[#047857] text-white' : 'bg-[#334155] text-[#64748b]'}`}>
                {t(`settings.${lang}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Notification */}
        <div className="bg-[#1e293b] rounded-2xl p-4">
          <p className="text-[#64748b] text-sm mb-3">{t('settings.notification')}</p>
          <div className="flex gap-2">
            <input type="time" value={notifValue} onChange={e => setNotifValue(e.target.value)}
              className="flex-1 bg-[#0f172a] text-[#f1f5f9] rounded-xl px-3 py-2 border border-[#334155] min-h-[44px]" />
            <button onClick={handleSaveNotification}
              className="px-4 py-2 bg-[#047857] text-white rounded-xl font-medium min-h-[44px]">
              {t('settings.notificationSave')}
            </button>
          </div>
          {notifMsg && <p className="text-[#f87171] text-xs mt-2">{notifMsg}</p>}
        </div>

        {/* Backup */}
        <div className="bg-[#1e293b] rounded-2xl p-4 space-y-3">
          <button onClick={exportBackup}
            className="w-full py-3 rounded-xl bg-[#334155] text-[#f1f5f9] font-medium min-h-[44px]">
            📤 {t('settings.export')}
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="w-full py-3 rounded-xl bg-[#334155] text-[#f1f5f9] font-medium min-h-[44px]">
            📥 {t('settings.import')}
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          {importError && <p className="text-[#f87171] text-xs">{importError}</p>}
        </div>

        {/* Reset */}
        <div className="bg-[#1e293b] rounded-2xl p-4">
          {!showResetConfirm ? (
            <button onClick={() => setShowResetConfirm(true)}
              className="w-full py-3 rounded-xl text-[#f87171] font-medium min-h-[44px]">
              🔄 {t('settings.reset')}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-[#f87171] text-sm text-center">{t('settings.resetConfirm')}</p>
              <div className="flex gap-2">
                <button onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-[#334155] text-[#f1f5f9] min-h-[44px]">{t('settings.cancel')}</button>
                <button onClick={handleReset}
                  className="flex-1 py-3 rounded-xl bg-[#f87171] text-white font-bold min-h-[44px]">{t('settings.reset')}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 2: Add notification scheduler to `src/main.tsx`**

```tsx
import './i18n'
import './tailwind.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useStore } from './store/store'

// Schedule daily notification if permission granted and time set
function scheduleNotification() {
  const { notificationTime, notificationPermission, language } = useStore.getState()
  if (!notificationTime || notificationPermission !== 'granted') return
  const [hh, mm] = notificationTime.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hh, mm, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  const ms = target.getTime() - now.getTime()
  setTimeout(() => {
    new Notification('قضاء', {
      body: language === 'ar' ? 'لا تنسَ قضاءك اليوم 🌙' : "Don't forget your Qadaa today 🌙",
      icon: '/icons/icon-192.png',
    })
  }, ms)
}

scheduleNotification()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 3: Test settings screen**

```bash
npm run dev
```

1. Navigate to Settings
2. Toggle language → AR/EN text switches
3. Export → JSON file downloads; verify it contains all state fields
4. Reset → confirm dialog → app resets to wizard
5. Import the exported JSON → state restores, navigates to dashboard

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: implement SettingsScreen with language, notifications, backup/restore"
```

---

## Task 9: PWA final configuration + build verification

**Files:**
- Add real icon assets to `public/icons/`
- Verify `vite.config.ts` PWA config
- Run build and check output

- [ ] **Step 1: Generate proper PWA icons**

Option A (if ImageMagick available):
```bash
convert -size 192x192 xc:#047857 -fill white -font DejaVu-Sans-Bold \
  -pointsize 80 -gravity center -annotate 0 "ق" public/icons/icon-192.png
convert -size 512x512 xc:#047857 -fill white -font DejaVu-Sans-Bold \
  -pointsize 220 -gravity center -annotate 0 "ق" public/icons/icon-512.png
cp public/icons/icon-512.png public/icons/icon-512-maskable.png
```

Option B (manual): Create any 192×192 and 512×512 PNG files with the app logo and place them in `public/icons/`. The maskable icon should have safe-zone padding (the content within the inner ~80% circle).

- [ ] **Step 2: Verify `vite.config.ts` is complete**

Check that `vite.config.ts` matches the config from Task 1. All 3 icons present in manifest, `runtimeCaching` for fonts, `globPatterns` includes js/css/html/png.

- [ ] **Step 3: Add `.gitignore` entries**

```bash
echo ".superpowers/" >> .gitignore
echo "dist/" >> .gitignore
```

- [ ] **Step 4: Run production build**

```bash
npm run build
```

Expected: `dist/` directory created with `index.html`, JS chunks, `manifest.webmanifest`, `sw.js`, and font files in `dist/fonts/`.

- [ ] **Step 5: Serve dist and verify**

```bash
npx serve dist -p 4173
```

Open http://localhost:4173. Check:
- App loads, redirects to `/wizard` or `/dashboard`
- DevTools → Application → Service Workers → SW registered
- DevTools → Application → Manifest → all 3 icons shown, `dir: rtl`
- DevTools → Application → Storage → LocalStorage has `qadaa-store`
- Disable network (DevTools → Network → Offline) → reload → app still loads

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: finalize PWA config, icons, build verification"
```

---

## Task 10: i18n sync to store language on app load

**Files:**
- Modify: `src/main.tsx`

The language is persisted in Zustand, but `i18next` starts with `'ar'` by default. If a user saved `'en'`, the app will show Arabic on next load until they toggle. Fix this.

- [ ] **Step 1: Read stored language and apply on boot in `src/main.tsx`**

Add before `ReactDOM.createRoot`:

```tsx
// Sync stored language to i18next on boot
const storedLang = useStore.getState().language
if (storedLang !== 'ar') {
  import('./i18n').then(({ default: i18n }) => {
    i18n.changeLanguage(storedLang)
  })
  document.documentElement.lang = storedLang
}
```

Since `i18n` is already imported at top of file, simplify to:

```tsx
import './i18n'
import './tailwind.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useStore } from './store/store'
import i18n from './i18n'

// Sync stored language
const { language, notificationTime, notificationPermission } = useStore.getState()
if (language !== 'ar') {
  i18n.changeLanguage(language)
  document.documentElement.lang = language
}

// Schedule notification
function scheduleNotification() {
  if (!notificationTime || notificationPermission !== 'granted') return
  const [hh, mm] = notificationTime.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hh, mm, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  setTimeout(() => {
    new Notification('قضاء', {
      body: language === 'ar' ? 'لا تنسَ قضاءك اليوم 🌙' : "Don't forget your Qadaa today 🌙",
      icon: '/icons/icon-192.png',
    })
  }, target.getTime() - now.getTime())
}
scheduleNotification()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 2: Test language persistence**

```bash
npm run dev
```

1. Go to Settings → switch to English
2. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
3. App should load in English immediately

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: sync stored language to i18next on boot"
```

---

## Verification Checklist

Run these after all tasks complete:

```bash
npm run dev
```

- [ ] First load → `/wizard`
- [ ] Wizard: age=30, puberty=15, 2 years → confirms totalMissedDays=730
- [ ] Dashboard: all prayers show 0/730
- [ ] Tap `+1` Fajr → recovered=1, streak=1, points=10, first_log badge, confetti
- [ ] Tap "Log Full Day" → all 5 prayers increment, points=110, confetti
- [ ] Tap `+1` Fajr again → recovered=3, points=120, no streak change
- [ ] Stats: streak=1, level=1, points=120, first_log badge shown
- [ ] Settings: toggle EN → text switches, dir stays rtl
- [ ] Settings: export → JSON downloads
- [ ] Settings: reset → state clears → /wizard
- [ ] Import exported JSON → state restores → dashboard shows same counts

```bash
npm run build && npx serve dist
```

- [ ] Lighthouse PWA ≥ 90
- [ ] Installable prompt appears
- [ ] Offline: disable network → reload → app loads, fonts render
