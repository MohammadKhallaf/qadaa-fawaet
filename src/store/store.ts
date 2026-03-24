import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fireConfetti } from '../components/confetti'
import { toLocalISODate } from '../utils/date'

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
  onboardingComplete: boolean
  dashboardTourComplete: boolean
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

  // Feature 1: Pace / daily target
  dailyTarget: number

  // Feature 4: Grace day
  graceUsedMonth: string | null

  // Feature 7: Dua after full day
  lastDuaShownDate: string | null

  // Feature 8: Daily intention
  intentionSetDate: string | null

  // Actions
  completeOnboarding: () => void
  completeDashboardTour: () => void
  completeWizard: (age: number, pubertyAge: number, periods: PrayerPeriod[]) => void
  logPrayer: (prayer: PrayerKey) => void
  logPrayerBatch: (prayer: PrayerKey, count: number) => void
  logFullDay: () => void
  setDailyTarget: (n: number) => void
  setLastDuaShownDate: (date: string) => void
  setIntentionSetDate: (date: string) => void
  setLanguage: (lang: 'ar' | 'en') => void
  setNotificationTime: (time: string | null) => void
  setNotificationPermission: (p: 'default' | 'granted' | 'denied') => void
  resetAll: () => void
  getBackupJson: () => string
  exportBackup: () => void
  importBackup: (json: string) => boolean
}

function updateStreak(state: Pick<AppState, 'streak' | 'lastLogDate' | 'loggedDates' | 'graceUsedMonth'>) {
  const today = toLocalISODate(new Date())
  const yesterday = toLocalISODate(new Date(Date.now() - 86400000))
  const twoDaysAgo = toLocalISODate(new Date(Date.now() - 2 * 86400000))
  const currentMonth = today.slice(0, 7) // 'YYYY-MM'

  let streak = state.streak
  let graceUsedMonth = state.graceUsedMonth

  if (state.lastLogDate === today) {
    // Same day — no change
  } else if (state.lastLogDate === yesterday) {
    streak += 1
  } else if (
    streak > 0 &&
    state.lastLogDate === twoDaysAgo &&
    graceUsedMonth !== currentMonth
  ) {
    // Grace day: preserve and extend streak, mark this month as used
    streak += 1
    graceUsedMonth = currentMonth
  } else {
    streak = 1
  }

  const loggedDates = state.loggedDates.includes(today)
    ? state.loggedDates
    : [...state.loggedDates, today]

  return { streak, lastLogDate: today, loggedDates, graceUsedMonth }
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
      onboardingComplete: false,
      dashboardTourComplete: false,
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
      dailyTarget: 5,
      graceUsedMonth: null,
      lastDuaShownDate: null,
      intentionSetDate: null,

      completeOnboarding: () => set({ onboardingComplete: true }),
      completeDashboardTour: () => set({ dashboardTourComplete: true }),

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
        const streakUpdate = updateStreak({ ...state, ...todayReset })
        const prevBadgeIds = new Set(state.badges.map(b => b.id))
        const partialState = { ...state, ...todayReset, prayers, todayPrayers, points, ...streakUpdate }
        const newBadges = checkBadges(partialState as AppState)
        const badges = [...state.badges, ...newBadges]
        set({ ...todayReset, prayers, todayPrayers, points, ...streakUpdate, badges })
        runConfettiChecks(prevBadgeIds, { ...partialState, badges } as AppState)
      },

      logPrayerBatch: (prayer, count) => {
        const state = get()
        if (count <= 0) return
        const todayReset = resetTodayIfNeeded(state)
        const prayers = { ...state.prayers }
        const remaining = state.totalMissedDays - prayers[prayer].recovered
        const actual = Math.min(count, remaining)
        if (actual <= 0) return
        prayers[prayer] = { recovered: prayers[prayer].recovered + actual }
        const todayPrayers = { ...(todayReset.todayPrayers ?? state.todayPrayers), [prayer]: true as const }
        const points = state.points + actual * 10
        const streakUpdate = updateStreak({ ...state, ...todayReset })
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
        const streakUpdate = updateStreak({ ...state, ...todayReset })
        const prevBadgeIds = new Set(state.badges.map(b => b.id))
        const partialState = { ...state, ...todayReset, prayers, todayPrayers, points, ...streakUpdate }
        const newBadges = checkBadges(partialState as AppState)
        const badges = [...state.badges, ...newBadges]
        set({ ...todayReset, prayers, todayPrayers, points, ...streakUpdate, badges })
        runConfettiChecks(prevBadgeIds, { ...partialState, badges } as AppState)
      },

      setDailyTarget: (dailyTarget) => set({ dailyTarget }),
      setLastDuaShownDate: (lastDuaShownDate) => set({ lastDuaShownDate }),
      setIntentionSetDate: (intentionSetDate) => set({ intentionSetDate }),
      setLanguage: (language) => set({ language }),
      setNotificationTime: (notificationTime) => set({ notificationTime }),
      setNotificationPermission: (notificationPermission) => set({ notificationPermission }),

      resetAll: () => {
        set({
          onboardingComplete: false, dashboardTourComplete: false,
          wizardComplete: false, age: 0, pubertyAge: 0, periods: [], totalMissedDays: 0,
          prayers: initialPrayers(), todayPrayers: {}, todayDate: null,
          streak: 0, lastLogDate: null, loggedDates: [], points: 0, badges: [],
          language: 'ar', notificationTime: null, notificationPermission: 'default',
          dailyTarget: 5, graceUsedMonth: null, lastDuaShownDate: null, intentionSetDate: null,
        })
      },

      getBackupJson: () => {
        const state = get()
        const backup = {
          wizardComplete: state.wizardComplete, age: state.age, pubertyAge: state.pubertyAge,
          periods: state.periods, totalMissedDays: state.totalMissedDays, prayers: state.prayers,
          todayPrayers: state.todayPrayers, todayDate: state.todayDate,
          streak: state.streak, lastLogDate: state.lastLogDate, loggedDates: state.loggedDates,
          points: state.points, badges: state.badges, language: state.language,
          notificationTime: state.notificationTime, notificationPermission: state.notificationPermission,
          dailyTarget: state.dailyTarget,
        }
        return JSON.stringify(backup)
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
          dailyTarget: state.dailyTarget,
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
        const {
          completeOnboarding, completeDashboardTour, completeWizard,
          logPrayer, logPrayerBatch, logFullDay,
          setDailyTarget, setLastDuaShownDate, setIntentionSetDate,
          setLanguage, setNotificationTime, setNotificationPermission,
          resetAll, getBackupJson, exportBackup, importBackup,
          ...rest
        } = state
        return rest
      },
    }
  )
)
