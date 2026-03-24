/**
 * Schedule a daily notification at the given HH:MM time using setTimeout.
 * Cancels any previously scheduled notification first.
 * Uses the Page Visibility API to reschedule when the tab becomes visible again.
 */

let _timerId: ReturnType<typeof setTimeout> | null = null
let _currentTime: string | null = null

function msUntil(hhmm: string): number {
  const [hh, mm] = hhmm.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hh, mm, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target.getTime() - now.getTime()
}

function fire(lang: string) {
  if (Notification.permission !== 'granted') return
  const title = lang === 'ar' ? 'قضاء 🕌' : 'Qadaa 🕌'
  const body  = lang === 'ar'
    ? 'حان وقت قضاء صلواتك اليومية'
    : 'Time for your daily prayer recovery'
  new Notification(title, { body, icon: '/icons/icon-192.png', tag: 'qadaa-daily' })
}

function schedule(hhmm: string, lang: string) {
  if (_timerId) clearTimeout(_timerId)
  _currentTime = hhmm
  const delay = msUntil(hhmm)
  _timerId = setTimeout(() => {
    fire(lang)
    // reschedule for next day
    schedule(hhmm, lang)
  }, delay)
}

function cancel() {
  if (_timerId) { clearTimeout(_timerId); _timerId = null }
  _currentTime = null
}

/** Call this on app startup and whenever notificationTime changes */
export function setupNotification(time: string | null, lang: string) {
  if (!time || Notification.permission !== 'granted') {
    cancel()
    return
  }
  // Only reschedule if time changed to avoid duplicate timers on re-renders
  if (time === _currentTime) return
  schedule(time, lang)
}

export function clearNotification() {
  cancel()
}
