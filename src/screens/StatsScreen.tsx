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
