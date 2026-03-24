import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/store'
import i18n from '../i18n'
import BottomNav from '../components/BottomNav'

export default function SettingsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { language, setLanguage, notificationTime, setNotificationTime,
    setNotificationPermission, notificationPermission, exportBackup, importBackup, resetAll } = useStore()

  const [notifValue, setNotifValue] = useState(notificationTime ?? '')
  const [notifMsg, setNotifMsg] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
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
      setNotifMsg(null)
    } else {
      setNotifMsg(t('settings.notificationDenied'))
    }
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
    <div className="min-h-screen bg-[#0f172a] pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">{t('settings.title')}</h1>
      </div>

      <div className="space-y-4 px-4">
        {/* Language */}
        <div className="bg-[#1e293b] rounded-2xl p-4">
          <p className="text-[#64748b] text-sm mb-3">{t('settings.language')}</p>
          <div className="flex gap-2">
            {(['ar', 'en'] as const).map(lang => (
              <button key={lang} onClick={() => handleLanguage(lang)}
                className={`flex-1 py-2 rounded-xl font-medium text-sm min-h-[44px] transition-colors ${language === lang ? 'bg-[#047857] text-white' : 'bg-[#334155] text-[#64748b]'}`}>
                {t(`settings.${lang}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Notification */}
        <div className="bg-[#1e293b] rounded-2xl p-4">
          <p className="text-[#64748b] text-sm mb-3">{t('settings.notification')}</p>
          <div className="flex gap-2">
            <input type="time" value={notifValue} onChange={e => setNotifValue(e.target.value)}
              className="flex-1 bg-[#0f172a] text-[#f1f5f9] rounded-xl px-3 py-2 border border-[#334155] min-h-[44px]" />
            <button onClick={handleSaveNotification}
              className="px-4 py-2 bg-[#047857] text-white rounded-xl font-medium min-h-[44px]">
              {t('settings.notificationSave')}
            </button>
          </div>
          {notifMsg && <p className="text-[#f87171] text-xs mt-2">{notifMsg}</p>}
        </div>

        {/* Backup */}
        <div className="bg-[#1e293b] rounded-2xl p-4 space-y-3">
          <button onClick={exportBackup}
            className="w-full py-3 rounded-xl bg-[#334155] text-[#f1f5f9] font-medium min-h-[44px]">
            📤 {t('settings.export')}
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="w-full py-3 rounded-xl bg-[#334155] text-[#f1f5f9] font-medium min-h-[44px]">
            📥 {t('settings.import')}
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          {importError && <p className="text-[#f87171] text-xs">{importError}</p>}
        </div>

        {/* Reset */}
        <div className="bg-[#1e293b] rounded-2xl p-4">
          {!showResetConfirm ? (
            <button onClick={() => setShowResetConfirm(true)}
              className="w-full py-3 rounded-xl text-[#f87171] font-medium min-h-[44px]">
              🔄 {t('settings.reset')}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-[#f87171] text-sm text-center">{t('settings.resetConfirm')}</p>
              <div className="flex gap-2">
                <button onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-[#334155] text-[#f1f5f9] min-h-[44px]">{t('settings.cancel')}</button>
                <button onClick={handleReset}
                  className="flex-1 py-3 rounded-xl bg-[#f87171] text-white font-bold min-h-[44px]">{t('settings.reset')}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
