import { useState, useEffect, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import { useStore, PRAYER_KEYS } from '../store/store'
import { useTranslation } from 'react-i18next'
import { toLocalISODate } from '../utils/date'
import StreakBadge from '../components/StreakBadge'
import TodayBanner from '../components/TodayBanner'
import PrayerRow from '../components/PrayerRow'
import BottomNav from '../components/BottomNav'
import WeeklyGrid from '../components/WeeklyGrid'
import HadithCard from '../components/HadithCard'
import CatchupBanner from '../components/CatchupBanner'
import DuaModal from '../components/DuaModal'
import IntentionSheet from '../components/IntentionSheet'
import { useDashboardTour } from '../hooks/useDashboardTour'

export default function DashboardScreen() {
  const { t } = useTranslation()
  const logFullDay = useStore(s => s.logFullDay)
  const todayPrayers = useStore(s => s.todayPrayers)
  const lastDuaShownDate = useStore(s => s.lastDuaShownDate)
  const setLastDuaShownDate = useStore(s => s.setLastDuaShownDate)
  const intentionSetDate = useStore(s => s.intentionSetDate)
  const wizardComplete = useStore(s => s.wizardComplete)
  const appName = t('app.name')

  const today = toLocalISODate(new Date())
  const loggedCount = Object.keys(todayPrayers).length

  // Feature 7: dua — use local dismissed state so store update doesn't re-hide modal
  const duaAlreadyShownToday = lastDuaShownDate === today
  const [duaDismissed, setDuaDismissed] = useState(duaAlreadyShownToday)
  const duaTriggered = useRef(duaAlreadyShownToday)
  // Trigger once when count reaches 5
  useEffect(() => {
    if (loggedCount >= 5 && !duaTriggered.current) {
      duaTriggered.current = true
      setDuaDismissed(false)
    }
  }, [loggedCount])

  const showDua = loggedCount >= 5 && !duaDismissed

  // Feature 8: show intention once per day (before first prayer)
  const showIntention = wizardComplete && intentionSetDate !== today && loggedCount === 0
  const [intentionDismissed, setIntentionDismissed] = useState(false)

  // Reset dismissal flags when date changes
  useEffect(() => {
    duaTriggered.current = lastDuaShownDate === today
    setDuaDismissed(lastDuaShownDate === today)
    setIntentionDismissed(false)
  }, [today]) // eslint-disable-line react-hooks/exhaustive-deps

  useDashboardTour()

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Centered content shell */}
      <div className="max-w-lg mx-auto pb-28">

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">{appName}</h1>
          <div data-tour="streak"><StreakBadge /></div>
        </div>

        {/* Today Banner */}
        <div data-tour="banner">
          <TodayBanner />
        </div>

        {/* Feature 10: Catch-up banner */}
        <CatchupBanner />

        {/* Section label */}
        <p className="text-[#475569] text-xs font-semibold uppercase tracking-widest px-4 mb-2">
          {t('dashboard.prayers')}
        </p>

        {/* Prayer rows */}
        <div>
          {PRAYER_KEYS.map((key, i) => (
            <div key={key} data-tour={i === 0 ? 'prayer-row' : undefined}>
              <PrayerRow prayerKey={key} />
            </div>
          ))}
        </div>

        {/* Feature 3: Weekly consistency grid */}
        <div className="mt-4">
          <WeeklyGrid />
        </div>

        {/* Feature 9: Daily hadith */}
        <HadithCard />

      </div>

      {/* Log full day — sticky above bottom nav */}
      <div className="fixed bottom-[57px] left-0 right-0 flex justify-center px-4 z-10 pointer-events-none" data-tour="log-full-day">
        <div className="w-full max-w-lg pointer-events-auto pb-2">
          <button
            onClick={logFullDay}
            className="w-full py-4 rounded-2xl font-bold text-base text-white shadow-xl shadow-[#047857]/30 active:scale-[0.98] transition-all duration-150 min-h-[52px]"
            style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}
          >
            ✓ {t('dashboard.logFullDay')}
          </button>
        </div>
      </div>

      <BottomNav />

      {/* Overlays: intention first, then dua (mutually exclusive) */}
      <AnimatePresence>
        {showIntention && !intentionDismissed && (
          <IntentionSheet key="intention" onClose={() => setIntentionDismissed(true)} />
        )}
        {showDua && (
          <DuaModal key="dua" onClose={() => { setLastDuaShownDate(today); setDuaDismissed(true) }} />
        )}
      </AnimatePresence>
    </div>
  )
}
