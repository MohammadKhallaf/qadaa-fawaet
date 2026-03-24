import './i18n'
import '../tailwind.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { useStore } from './store/store'
import i18n from './i18n'

// Sync stored language to i18next on boot
const { language, notificationTime, notificationPermission } = useStore.getState()
if (language !== 'ar') {
  i18n.changeLanguage(language)
  document.documentElement.lang = language
}

// Schedule daily notification if permission granted and time set
function scheduleNotification() {
  if (!notificationTime || notificationPermission !== 'granted') return
  const [hh, mm] = notificationTime.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hh, mm, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  setTimeout(() => {
    new Notification('قضاء', {
      body: language === 'ar' ? 'لا تنسَ قضاءك اليوم 🌙' : "Don't forget your Qadaa today 🌙",
      icon: '/icons/icon-192.png',
    })
  }, target.getTime() - now.getTime())
}
scheduleNotification()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
