import { useNavigate, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'

const tabs = [
  { path: '/dashboard', icon: '🏠', key: 'nav.dashboard' },
  { path: '/stats',     icon: '📊', key: 'nav.stats' },
  { path: '/settings',  icon: '⚙️',  key: 'nav.settings' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t border-[#334155] flex z-10">
      {tabs.map(tab => {
        const active = location.pathname === tab.path
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 min-h-[56px] transition-colors ${active ? 'text-[#047857]' : 'text-[#64748b]'}`}>
            <span className="text-xl">{tab.icon}</span>
            {active && <span className="text-[10px] font-bold">{t(tab.key)}</span>}
          </button>
        )
      })}
    </nav>
  )
}
