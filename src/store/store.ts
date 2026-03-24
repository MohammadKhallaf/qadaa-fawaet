import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fireConfetti } from '../components/confetti'

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
  { id: 'first_log',    check: (s: AppState) => s.points > 0 },
  { id: 'first_week',   check: (s: AppState) => s.streak >= 7 },
  { id: 'warrior_30',   check: (s: AppState) => s.streak >= 30 },
  { id: 'golden_year',  check: (s: AppState) => s.streak >= 365 },
  { id: 'quarter_way',  check: (s: AppState) => bestProgress(s) >= 25 },
  { id: 'halfway',      check: (s: AppState) => bestProgress(s) >= 50 },
  { id: 'almost_there', check: (s: AppState) => bestProgress(s) >= 75 },
  { id: 'complete',     check: (s: AppState) => bestProgress(s) >= 100 },
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
        const todayPrayers: Partial<Record<PrayerKey, true>> = Object.fromEntries(PRAYER_KEYS.map(k => [k, true as const]))
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
        const { completeWizard, logPrayer, logFullDay, setLanguage, setNotificationTime,
          setNotificationPermission, resetAll, exportBackup, importBackup, ...rest } = state
        return rest
      },
    }
  )
)
