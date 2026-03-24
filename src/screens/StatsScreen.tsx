import { useStore, PRAYER_KEYS, type AppState } from '../store/store'
import { useTranslation } from 'react-i18next'
import { useStreak } from '../hooks/useStreak'
import BadgeGrid from '../components/BadgeCard'
import BottomNav from '../components/BottomNav'

const BADGE_ORDER = ['first_log','first_week','warrior_30','golden_year','quarter_way','halfway','almost_there','complete']
const BADGE_ICONS: Record<string, string> = {
  first_log: '🌱', first_week: '🔥', warrior_30: '⚔️', golden_year: '🌟',
  quarter_way: '🎯', halfway: '🏃', almost_there: '🏅', complete: '🏆',
}

// mirrors BADGE_DEFINITIONS from store — gives a 0-100 progress % toward each badge
function badgeProgress(id: string, s: AppState): number {
  const pct = (n: number, total: number) => Math.min((n / total) * 100, 99)
  switch (id) {
    case 'first_log':    return s.points > 0 ? 100 : 0
    case 'first_week':   return pct(s.streak, 7)
    case 'warrior_30':   return pct(s.streak, 30)
    case 'golden_year':  return pct(s.streak, 365)
    case 'quarter_way': {
      if (s.totalMissedDays === 0) return 0
      const best = Math.max(...PRAYER_KEYS.map(k => (s.prayers[k].recovered / s.totalMissedDays) * 100))
      return pct(best, 25)
    }
    case 'halfway': {
      if (s.totalMissedDays === 0) return 0
      const best = Math.max(...PRAYER_KEYS.map(k => (s.prayers[k].recovered / s.totalMissedDays) * 100))
      return pct(best, 50)
    }
    case 'almost_there': {
      if (s.totalMissedDays === 0) return 0
      const best = Math.max(...PRAYER_KEYS.map(k => (s.prayers[k].recovered / s.totalMissedDays) * 100))
      return pct(best, 75)
    }
    case 'complete': {
      if (s.totalMissedDays === 0) return 0
      const best = Math.max(...PRAYER_KEYS.map(k => (s.prayers[k].recovered / s.totalMissedDays) * 100))
      return pct(best, 100)
    }
    default: return 0
  }
}

function NextBadgeHint() {
  const { t } = useTranslation()
  const state = useStore(s => s)
  const unlockedIds = new Set(state.badges.map(b => b.id))
  const nextId = BADGE_ORDER.find(id => !unlockedIds.has(id))
  if (!nextId) return null
  const pct = Math.round(badgeProgress(nextId, state as AppState))
  return (
    <div className="mx-4 mb-4 bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-4">
      <p className="text-[#475569] text-xs font-semibold uppercase tracking-widest mb-3">{t('stats.nextBadge')}</p>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{BADGE_ICONS[nextId]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[#e2e8f0] text-sm font-semibold mb-1.5">{t(`stats.badges_data.${nextId}`)}</p>
          <div className="bg-[#0f172a] rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #047857, #34d399)' }}
            />
          </div>
          <p className="text-[#475569] text-xs mt-1">{t('stats.nextBadgeProgress', { pct })}</p>
        </div>
      </div>
    </div>
  )
}

function getRank(points: number, t: (k: string) => string): { label: string; color: string; bg: string } {
  if (points >= 5000) return { label: t('stats.ranks.platinum'), color: '#e2e8f0', bg: '#334155' }
  if (points >= 2000) return { label: t('stats.ranks.gold'),    color: '#f59e0b', bg: '#451a03' }
  if (points >= 500)  return { label: t('stats.ranks.silver'),  color: '#94a3b8', bg: '#1e293b' }
  return { label: t('stats.ranks.bronze'), color: '#d97706', bg: '#1c1007' }
}

function CompletionEstimate() {
  const { t, i18n } = useTranslation()
  const numLocale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  const totalMissedDays = useStore(s => s.totalMissedDays)
  const prayers = useStore(s => s.prayers)
  const loggedDates = useStore(s => s.loggedDates)
  const points = useStore(s => s.points)

  const totalPrayers = totalMissedDays * 5
  const recoveredPrayers = PRAYER_KEYS.reduce((sum, k) => sum + prayers[k].recovered, 0)
  const remaining = totalPrayers - recoveredPrayers

  if (loggedDates.length < 3) {
    return (
      <p className="text-[#475569] text-sm text-center py-2">{t('stats.estimateNoData')}</p>
    )
  }

  const avgPerDay = (points / 10) / loggedDates.length
  const daysToFinish = avgPerDay > 0 ? Math.ceil(remaining / avgPerDay) : Infinity

  let dateStr = ''
  try {
    const finishDate = new Date()
    finishDate.setDate(finishDate.getDate() + daysToFinish)
    dateStr = finishDate.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG-u-ca-islamic' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  } catch {
    const finishDate = new Date()
    finishDate.setDate(finishDate.getDate() + daysToFinish)
    dateStr = finishDate.toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const years = (daysToFinish / 365).toFixed(1)

  return (
    <div className="space-y-1.5">
      <p className="text-[#94a3b8] text-sm">
        {t('stats.estimateYears', { years: parseFloat(years).toLocaleString(numLocale) })}
      </p>
      <p className="text-[#64748b] text-xs">{t('stats.estimateDate', { date: dateStr })}</p>
      <p className="text-[#475569] text-xs">
        {t('stats.estimatePace', { count: avgPerDay.toFixed(1) })}
      </p>
    </div>
  )
}

export default function StatsScreen() {
  const { t, i18n } = useTranslation()
  const numLocale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  const { streak } = useStreak()
  const points = useStore(s => s.points)
  const badges = useStore(s => s.badges)
  const loggedDates = useStore(s => s.loggedDates)
  const level = Math.floor(loggedDates.length / 30) + 1
  const rank = getRank(points, t)

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="max-w-lg mx-auto pb-24">

        {/* Header */}
        <div className="px-4 pt-8 pb-5">
          <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">{t('stats.title')}</h1>
        </div>

        {/* Streak + Level row */}
        <div className="grid grid-cols-2 gap-3 px-4 mb-3">
          <div className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-4 flex flex-col items-center gap-1">
            <span className="text-3xl">🔥</span>
            <p className="text-2xl font-bold text-[#f59e0b] tabular-nums">{streak}</p>
            <p className="text-xs text-[#475569] text-center">{t('stats.streak')}</p>
          </div>
          <div className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-4 flex flex-col items-center gap-1">
            <span className="text-3xl">⭐</span>
            <p className="text-2xl font-bold text-[#34d399] tabular-nums">{level}</p>
            <p className="text-xs text-[#475569] text-center">{t('stats.level')}</p>
            <p className="text-[10px] text-[#334155] text-center leading-tight">{t('stats.levelHint')}</p>
          </div>
        </div>

        {/* Points + Rank card */}
        <div className="mx-4 mb-4 bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-4 flex items-center justify-between">
          <div
            className="px-3 py-1.5 rounded-xl border"
            style={{ background: rank.bg, borderColor: rank.color + '40' }}
          >
            <p className="font-bold text-sm" style={{ color: rank.color }}>{rank.label}</p>
          </div>
          <div className="text-end">
            <p className="text-[#475569] text-xs font-semibold uppercase tracking-widest mb-0.5">{t('stats.points')}</p>
            <p className="text-3xl font-bold text-[#f59e0b] tabular-nums">{points.toLocaleString(numLocale)}</p>
          </div>
        </div>

        {/* Feature 2: Completion estimate */}
        <div className="mx-4 mb-4 bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-4">
          <p className="text-[#475569] text-xs font-semibold uppercase tracking-widest mb-3">{t('stats.estimateTitle')}</p>
          <CompletionEstimate />
        </div>

        {/* Next badge hint */}
        <NextBadgeHint />

        {/* Badges header */}
        <div className="px-4 mb-3">
          <p className="text-[#475569] text-xs font-semibold uppercase tracking-widest">{t('stats.badges')}</p>
        </div>
        <BadgeGrid badges={badges} />

      </div>
      <BottomNav />
    </div>
  )
}
