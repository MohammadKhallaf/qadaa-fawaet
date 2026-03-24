import { useStore } from '../store/store'
import { useTranslation } from 'react-i18next'

export default function TodayBanner() {
  const { t, i18n } = useTranslation()
  const numLocale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  const todayPrayers = useStore(s => s.todayPrayers)
  const dailyTarget = useStore(s => s.dailyTarget)
  const count = Object.keys(todayPrayers).length
  const pct = Math.min((count / dailyTarget) * 100, 100)
  const isDone = count >= dailyTarget

  return (
    <div className="bg-gradient-to-bl from-[#064e3b] to-[#0f2d20] rounded-2xl p-4 mx-4 mb-3 border border-[#065f46]/50">
      {/* Row: label right, dots+count left (RTL) */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[#34d399] text-sm font-bold">
          {t('dashboard.today')}
        </p>
        <div className="flex items-center gap-2">
          {/* Dot progress indicators — one per dailyTarget slot (max 10 dots) */}
          {dailyTarget <= 10 && (
            <div className="flex gap-1 items-center">
              {Array.from({ length: dailyTarget }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i < count
                      ? 'w-3 bg-[#34d399]'
                      : 'w-1.5 bg-[#1a3d2b]'
                  }`}
                />
              ))}
            </div>
          )}
          <span className={`text-sm font-medium tabular-nums ${isDone ? 'text-[#34d399]' : 'text-[#64748b]'}`} dir="ltr">
            {count.toLocaleString(numLocale)}/{dailyTarget.toLocaleString(numLocale)}
          </span>
        </div>
      </div>
      {/* Progress bar */}
      <div className="bg-[#0a1f15] rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: isDone
              ? 'linear-gradient(90deg, #047857, #34d399)'
              : 'linear-gradient(90deg, #065f46, #34d399)',
            minWidth: count > 0 ? '8px' : '0',
          }}
        />
      </div>
    </div>
  )
}
