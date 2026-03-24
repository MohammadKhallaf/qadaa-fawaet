import { useStore, type PrayerKey } from '../store/store'
import { useTranslation } from 'react-i18next'

interface Props {
  prayerKey: PrayerKey
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 50 ? '#047857' : '#f59e0b'
  return (
    <svg width="44" height="44" className="-rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="#334155" strokeWidth="4" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      <text x="22" y="22" dominantBaseline="middle" textAnchor="middle"
        fill={color} fontSize="9" fontWeight="bold" className="rotate-90 origin-[22px_22px]">
        {Math.round(pct)}%
      </text>
    </svg>
  )
}

export default function PrayerRow({ prayerKey }: Props) {
  const { t } = useTranslation()
  const prayer = useStore(s => s.prayers[prayerKey])
  const totalMissedDays = useStore(s => s.totalMissedDays)
  const logPrayer = useStore(s => s.logPrayer)

  const pct = totalMissedDays > 0 ? Math.min((prayer.recovered / totalMissedDays) * 100, 100) : 0
  const isDone = prayer.recovered >= totalMissedDays

  return (
    <div className="flex items-center justify-between bg-[#1e293b] rounded-2xl px-4 py-3 mx-4 mb-3">
      <div>
        <p className="text-[#f1f5f9] font-medium">{t(`prayers.${prayerKey}`)}</p>
        <p className="text-[#64748b] text-xs mt-0.5">
          {prayer.recovered.toLocaleString()} / {totalMissedDays.toLocaleString()} {t('dashboard.recovered')}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ProgressRing pct={pct} />
        <button
          onClick={() => logPrayer(prayerKey)}
          disabled={isDone}
          className="w-11 h-11 rounded-xl bg-[#047857] text-white font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          +١
        </button>
      </div>
    </div>
  )
}
