import { useStore } from '../store/store'

function toLocalISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function useStreak(): { streak: number; isAtRisk: boolean } {
  const streak = useStore(s => s.streak)
  const lastLogDate = useStore(s => s.lastLogDate)
  const yesterday = toLocalISODate(new Date(Date.now() - 86400000))
  const isAtRisk = lastLogDate === yesterday  // logged yesterday but not today
  return { streak, isAtRisk }
}
