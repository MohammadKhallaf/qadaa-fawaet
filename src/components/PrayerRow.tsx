import { useState, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import { useStore, type PrayerKey } from '../store/store'
import { useTranslation } from 'react-i18next'
import BatchLogPopover from './BatchLogPopover'

interface Props {
  prayerKey: PrayerKey
}

const PRAYER_ICONS: Record<string, string> = {
  fajr:    '🌙',
  dhuhr:   '☀️',
  asr:     '🌤️',
  maghrib: '🌅',
  isha:    '🌃',
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 16
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 100 ? '#34d399' : pct >= 50 ? '#047857' : '#f59e0b'
  return (
    <svg width="40" height="40" className="-rotate-90" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r={r} fill="none" stroke="#1e3a2f" strokeWidth="3.5" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x="20" y="20" dominantBaseline="middle" textAnchor="middle"
        fill={color} fontSize="7.5" fontWeight="700" className="rotate-90 origin-[20px_20px]">
        {Math.round(pct)}%
      </text>
    </svg>
  )
}

export default function PrayerRow({ prayerKey }: Props) {
  const { t, i18n } = useTranslation()
  const numLocale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  const prayer = useStore(s => s.prayers[prayerKey])
  const totalMissedDays = useStore(s => s.totalMissedDays)
  const logPrayer = useStore(s => s.logPrayer)
  const logPrayerBatch = useStore(s => s.logPrayerBatch)

  const [showBatch, setShowBatch] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pct = totalMissedDays > 0 ? Math.min((prayer.recovered / totalMissedDays) * 100, 100) : 0
  const isDone = prayer.recovered >= totalMissedDays && totalMissedDays > 0
  const remaining = Math.max(0, totalMissedDays - prayer.recovered)

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault()
    longPressTimer.current = setTimeout(() => {
      setShowBatch(true)
    }, 500)
  }

  function handlePointerUp() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function handleClick() {
    if (!showBatch && !isDone) {
      logPrayer(prayerKey)
    }
  }

  return (
    <div className={`flex items-center justify-between rounded-2xl px-4 py-3.5 mx-4 mb-2.5 border transition-colors ${
      isDone ? 'bg-[#0a2318] border-[#065f46]/70' : 'bg-[#1e293b] border-[#334155]/50'
    }`}>
      {/* Prayer name + stats (right side in RTL) */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl w-7 text-center flex-shrink-0">{PRAYER_ICONS[prayerKey]}</span>
        <div className="min-w-0">
          <p className={`font-semibold text-sm ${isDone ? 'text-[#34d399]' : 'text-[#e2e8f0]'}`}>
            {t(`prayers.${prayerKey}`)}
          </p>
          {/* Feature 5: Framing flip — recovered is hero */}
          <p className={`text-xs font-bold mt-0.5 ${prayer.recovered > 0 ? 'text-[#34d399]' : 'text-[#334155]'}`}>
            {prayer.recovered.toLocaleString(numLocale)} {t('dashboard.recovered')}
          </p>
          {remaining > 0 && (
            <p className="text-[#475569] text-[10px]">
              {t('dashboard.remaining', { count: remaining.toLocaleString(numLocale) })}
            </p>
          )}
        </div>
      </div>

      {/* Controls (left side in RTL) */}
      <div className="flex items-center gap-2.5 flex-shrink-0 relative">
        <ProgressRing pct={pct} />

        {/* Feature 6: Long-press for batch log */}
        <button
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onContextMenu={e => e.preventDefault()}
          onClick={handleClick}
          disabled={isDone}
          className={`w-10 h-10 rounded-xl font-bold text-sm flex items-center justify-center flex-shrink-0 transition-all select-none ${
            isDone
              ? 'bg-[#065f46]/30 text-[#34d399]/50 cursor-not-allowed'
              : 'bg-[#047857] text-white shadow-md shadow-[#047857]/30 hover:bg-[#059669] active:scale-90'
          }`}
        >
          {isDone ? '✓' : '+١'}
        </button>

        {/* Batch log popover */}
        <AnimatePresence>
          {showBatch && (
            <BatchLogPopover
              max={remaining}
              onConfirm={(n) => logPrayerBatch(prayerKey, n)}
              onClose={() => setShowBatch(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
