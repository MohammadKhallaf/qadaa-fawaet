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
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-center">
      <div className="w-full max-w-lg bg-[#1e293b]/95 backdrop-blur border-t border-[#334155]/60 flex">
        {tabs.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 min-h-[56px] transition-all duration-200 ${
                active ? 'text-[#34d399]' : 'text-[#475569] hover:text-[#94a3b8]'
              }`}
            >
              <span className={`text-lg transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-semibold tracking-wide transition-all duration-200 ${
                active ? 'opacity-100' : 'opacity-50'
              }`}>
                {t(tab.key)}
              </span>
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#34d399] rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
