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
