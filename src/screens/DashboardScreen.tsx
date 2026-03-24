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
