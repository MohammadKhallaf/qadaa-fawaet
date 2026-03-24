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
