import { useStore } from '../store/store'
import { useTranslation } from 'react-i18next'
import { toLocalISODate } from '../utils/date'

export default function WeeklyGrid() {
  const { t } = useTranslation()
  const loggedDates = useStore(s => s.loggedDates)
  const logged = new Set(loggedDates)

  // Build 35 cells: 5 weeks × 7 days, ending today
  const today = new Date()
  const cells: { date: string; logged: boolean; isToday: boolean; isFuture: boolean }[] = []
  const startOffset = 34 // 34 days ago = cell 0
  for (let i = startOffset; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = toLocalISODate(d)
    cells.push({
      date: dateStr,
      logged: logged.has(dateStr),
      isToday: i === 0,
      isFuture: false,
    })
  }

  return (
    <div className="mx-4 mb-4">
      <p className="text-[#475569] text-xs font-semibold uppercase tracking-widest mb-2">
        {t('dashboard.weeklyGrid')}
      </p>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map(cell => (
          <div
            key={cell.date}
            title={cell.date}
            className={`aspect-square rounded-md transition-colors ${
              cell.isToday
                ? cell.logged
                  ? 'bg-[#34d399] ring-2 ring-[#34d399]/40'
                  : 'bg-[#1e293b] ring-2 ring-[#475569]/50'
                : cell.logged
                  ? 'bg-[#047857]'
                  : 'bg-[#1e293b]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
