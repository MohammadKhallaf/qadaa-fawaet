import { useStreak } from '../hooks/useStreak'
import { useStore } from '../store/store'
import { useTranslation } from 'react-i18next'
import { toLocalISODate } from '../utils/date'

export default function StreakBadge() {
  const { t } = useTranslation()
  const { streak, isAtRisk } = useStreak()
  const loggedDates = useStore(s => s.loggedDates)
  const graceUsedMonth = useStore(s => s.graceUsedMonth)
  const level = Math.floor(loggedDates.length / 30) + 1
  const currentMonth = toLocalISODate(new Date()).slice(0, 7)
  const graceUsed = graceUsedMonth === currentMonth

  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex items-center gap-1.5 bg-[#1e293b] border rounded-xl px-3 py-1.5 ${
        isAtRisk ? 'border-[#f59e0b]/50' : 'border-[#334155]'
      }`}>
        <span className={`text-base ${isAtRisk ? 'animate-pulse' : ''}`}>🔥</span>
        <span className="text-[#f59e0b] font-bold text-sm tabular-nums">{streak}</span>
        {/* Feature 4: grace day indicator */}
        {graceUsed && <span className="text-xs opacity-70" title={t('settings.graceDay')}>🤲</span>}
      </div>
      <div className="flex items-center gap-1.5 bg-[#1e293b] border border-[#334155] rounded-xl px-3 py-1.5">
        <span className="text-base">⭐</span>
        <span className="text-[#94a3b8] text-xs font-medium">{t('stats.level')} {level}</span>
      </div>
    </div>
  )
}
