import { useStore } from '../store/store'
import { useTranslation } from 'react-i18next'

export default function CatchupBanner() {
  const { t, i18n } = useTranslation()
  const numLocale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  const todayPrayers = useStore(s => s.todayPrayers)
  const dailyTarget = useStore(s => s.dailyTarget)
  const count = Object.keys(todayPrayers).length
  const behind = dailyTarget - count

  if (behind <= 0) return null

  return (
    <div className="mx-4 mb-3 bg-[#451a03]/60 border border-[#92400e]/40 rounded-2xl px-4 py-2.5 flex items-center gap-2">
      <span className="text-base flex-shrink-0">⚡</span>
      <p className="text-[#fbbf24] text-xs font-medium leading-snug">
        {t('dashboard.catchupBehind', { count: behind.toLocaleString(numLocale) })}
      </p>
    </div>
  )
}
