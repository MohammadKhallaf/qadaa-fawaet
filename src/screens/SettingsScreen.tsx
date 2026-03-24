import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/store'
import { toLocalISODate } from '../utils/date'
import { setupNotification } from '../utils/notifications'
import i18n from '../i18n'
import BottomNav from '../components/BottomNav'
import ShareModal from '../components/ShareModal'

export default function SettingsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { language, setLanguage, notificationTime, setNotificationTime,
    setNotificationPermission, notificationPermission, exportBackup, importBackup, resetAll } = useStore()

  const graceUsedMonth = useStore(s => s.graceUsedMonth)
  const dailyTarget = useStore(s => s.dailyTarget)
  const setDailyTarget = useStore(s => s.setDailyTarget)
  const currentMonth = toLocalISODate(new Date()).slice(0, 7)
  const graceUsedThisMonth = graceUsedMonth === currentMonth

  const [notifValue, setNotifValue] = useState(notificationTime ?? '08:00')
  const [notifMsg, setNotifMsg] = useState<string | null>(null)
  const [notifSaved, setNotifSaved] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [targetValue, setTargetValue] = useState(String(dailyTarget))
  const [targetSaved, setTargetSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSaveNotification() {
    if (!notifValue) return
    let permission = notificationPermission
    if (permission !== 'granted') {
      const result = await Notification.requestPermission()
      permission = result as 'default' | 'granted' | 'denied'
      setNotificationPermission(permission)
    }
    if (permission === 'granted') {
      setNotificationTime(notifValue)
      setupNotification(notifValue, language)
      setNotifMsg(null)
      setNotifSaved(true)
      setTimeout(() => setNotifSaved(false), 2000)
    } else {
      setNotifMsg(t('settings.notificationDenied'))
    }
  }

  function handleSaveTarget() {
    const n = parseInt(targetValue)
    if (!n || n < 1 || n > 100) return
    setDailyTarget(n)
    setTargetSaved(true)
    setTimeout(() => setTargetSaved(false), 2000)
  }

  function handleLanguage(lang: 'ar' | 'en') {
    setLanguage(lang)
    i18n.changeLanguage(lang)
    document.documentElement.lang = lang
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const json = ev.target?.result as string
      const ok = importBackup(json)
      if (!ok) setImportError(t('errors.importFailed'))
      else setImportError(null)
    }
    reader.readAsText(file)
  }

  function handleReset() {
    resetAll()
    i18n.changeLanguage('ar')
    document.documentElement.lang = 'ar'
    navigate('/wizard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="max-w-lg mx-auto pb-24">

        {/* Header */}
        <div className="px-4 pt-8 pb-5">
          <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">{t('settings.title')}</h1>
        </div>

        <div className="space-y-3 px-4">

          {/* Language */}
          <section className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-4">
            <p className="text-[#475569] text-xs font-semibold uppercase tracking-widest mb-3">{t('settings.language')}</p>
            <div className="flex gap-2">
              {(['ar', 'en'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguage(lang)}
                  className={`flex-1 py-2.5 rounded-xl font-semibold text-sm min-h-[44px] transition-all duration-200 ${
                    language === lang
                      ? 'bg-[#047857] text-white shadow-md shadow-[#047857]/30'
                      : 'bg-[#0f172a] text-[#64748b] border border-[#334155] hover:border-[#475569]'
                  }`}
                >
                  {t(`settings.${lang}`)}
                </button>
              ))}
            </div>
          </section>

          {/* Daily Target */}
          <section className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-4">
            <p className="text-[#475569] text-xs font-semibold uppercase tracking-widest mb-3">{t('dashboard.targetLabel')}</p>
            <div className="flex gap-2 items-stretch">
              <button
                onClick={handleSaveTarget}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm min-h-[44px] flex-shrink-0 transition-colors ${
                  targetSaved ? 'bg-[#34d399] text-[#0a2318]' : 'bg-[#047857] text-white hover:bg-[#059669]'
                }`}
              >
                {targetSaved ? t('dashboard.targetSaved') : t('settings.notificationSave')}
              </button>
              <input
                type="number"
                min={1}
                max={100}
                value={targetValue}
                onChange={e => setTargetValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveTarget()}
                className="flex-1 bg-[#0f172a] text-[#f1f5f9] rounded-xl px-3 py-2.5 border border-[#334155] min-h-[44px] focus:border-[#047857] outline-none transition-colors text-center text-lg font-bold"
              />
            </div>
          </section>

          {/* Notification */}
          <section className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-4">
            <p className="text-[#475569] text-xs font-semibold uppercase tracking-widest mb-3">{t('settings.notification')}</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(['06:00','08:00','10:00','14:00','20:00','22:00'] as const).map(time => (
                <button
                  key={time}
                  onClick={() => setNotifValue(time)}
                  className={`py-2.5 rounded-xl text-sm font-semibold min-h-[44px] transition-colors ${
                    notifValue === time
                      ? 'bg-[#047857] text-white'
                      : 'bg-[#0f172a] text-[#94a3b8] border border-[#334155] hover:border-[#475569]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-stretch">
              <button
                onClick={handleSaveNotification}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm min-h-[44px] flex-shrink-0 transition-colors ${
                  notifSaved ? 'bg-[#34d399] text-[#0a2318]' : 'bg-[#047857] text-white hover:bg-[#059669]'
                }`}
              >
                {notifSaved ? '✓' : t('settings.notificationSave')}
              </button>
              <input
                type="time"
                value={notifValue}
                onChange={e => setNotifValue(e.target.value)}
                className="flex-1 bg-[#0f172a] text-[#f1f5f9] rounded-xl px-3 py-2.5 border border-[#334155] min-h-[44px] focus:border-[#047857] outline-none transition-colors text-center font-bold"
              />
            </div>
            {notifMsg && <p className="text-[#f87171] text-xs mt-2">{notifMsg}</p>}
          </section>

          {/* Sync & Backup */}
          <section className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-4 space-y-2.5">
            <p className="text-[#475569] text-xs font-semibold uppercase tracking-widest mb-3">{t('settings.sync')}</p>
            <button
              onClick={() => setShowShare(true)}
              className="w-full py-3 rounded-xl font-bold text-sm min-h-[44px] flex items-center justify-center gap-2 text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}
            >
              <span>📲</span> {t('settings.sync')}
            </button>
            <div className="flex gap-2">
              <button
                onClick={exportBackup}
                className="flex-1 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-[#94a3b8] text-sm min-h-[44px] hover:border-[#475569] transition-colors"
              >
                📤 {t('settings.export')}
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex-1 py-2.5 rounded-xl bg-[#0f172a] border border-[#334155] text-[#94a3b8] text-sm min-h-[44px] hover:border-[#475569] transition-colors"
              >
                📥 {t('settings.import')}
              </button>
            </div>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            {importError && <p className="text-[#f87171] text-xs">{importError}</p>}
          </section>

          {/* Grace Day info */}
          <section className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-4">
            <p className="text-[#475569] text-xs font-semibold uppercase tracking-widest mb-3">{t('settings.graceDay')}</p>
            <div className="flex items-center justify-between">
              <p className="text-[#94a3b8] text-sm">{t('settings.graceDay')}</p>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                graceUsedThisMonth
                  ? 'bg-[#334155]/50 text-[#475569]'
                  : 'bg-[#047857]/20 text-[#34d399]'
              }`}>
                {graceUsedThisMonth
                  ? t('settings.graceDayRemaining_zero')
                  : t('settings.graceDayRemaining_one', { count: 1 })
                }
              </span>
            </div>
            <p className="text-[#475569] text-xs mt-2">{t('settings.graceDayHint')}</p>
          </section>

          {/* Feedback */}
          <section className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-4">
            <p className="text-[#475569] text-xs font-semibold uppercase tracking-widest mb-3">{t('settings.feedback')}</p>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSf0NYAuWgC3RpcaCfTZi1Cgn0T1v3pd6ApjI660N19wPNry7w/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl font-bold text-sm min-h-[44px] flex items-center justify-center gap-2 text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)', display: 'flex' }}
            >
              <span>💬</span> {t('settings.feedback')}
            </a>
            <p className="text-[#475569] text-xs mt-2 text-center">{t('settings.feedbackHint')}</p>
          </section>

          {/* Reset */}
          <section className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl p-4">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-3 rounded-xl text-[#f87171] font-medium text-sm min-h-[44px] hover:bg-[#f87171]/10 transition-colors"
              >
                🔄 {t('settings.reset')}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-[#f87171] text-sm text-center">{t('settings.resetConfirm')}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-3 rounded-xl bg-[#0f172a] border border-[#334155] text-[#f1f5f9] text-sm min-h-[44px]"
                  >
                    {t('settings.cancel')}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 rounded-xl bg-[#f87171] text-white font-bold text-sm min-h-[44px]"
                  >
                    {t('settings.reset')}
                  </button>
                </div>
              </div>
            )}
          </section>

        </div>
      </div>

      <BottomNav />
      {showShare && <ShareModal onClose={() => setShowShare(false)} />}
    </div>
  )
}
