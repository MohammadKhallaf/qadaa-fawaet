import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import { useEffect } from 'react'
import { useStore } from './store/store'
import { setupNotification } from './utils/notifications'
import WizardScreen from './screens/WizardScreen'
import DashboardScreen from './screens/DashboardScreen'
import StatsScreen from './screens/StatsScreen'
import SettingsScreen from './screens/SettingsScreen'
import OnboardingScreen from './screens/OnboardingScreen'
import type { ReactNode } from 'react'

function RootRedirect() {
  const onboardingComplete = useStore(s => s.onboardingComplete)
  const wizardComplete = useStore(s => s.wizardComplete)
  if (!onboardingComplete) return <Navigate to="/onboarding" replace />
  return <Navigate to={wizardComplete ? '/dashboard' : '/wizard'} replace />
}

function RequireWizard({ children }: { children: ReactNode }) {
  const wizardComplete = useStore(s => s.wizardComplete)
  if (!wizardComplete) return <Navigate to="/wizard" replace />
  return <>{children}</>
}

const router = createBrowserRouter([
  { path: '/',            element: <RootRedirect /> },
  { path: '/onboarding',  element: <OnboardingScreen /> },
  { path: '/wizard',      element: <WizardScreen /> },
  { path: '/dashboard', element: <RequireWizard><DashboardScreen /></RequireWizard> },
  { path: '/stats',     element: <RequireWizard><StatsScreen /></RequireWizard> },
  { path: '/settings',  element: <SettingsScreen /> },
])

function NotificationBootstrap() {
  const notificationTime = useStore(s => s.notificationTime)
  const notificationPermission = useStore(s => s.notificationPermission)
  const language = useStore(s => s.language)

  useEffect(() => {
    if (notificationPermission === 'granted') {
      setupNotification(notificationTime, language)
    }
  }, [notificationTime, notificationPermission, language])

  return null
}

export default function App() {
  return (
    <>
      <NotificationBootstrap />
      <RouterProvider router={router} />
    </>
  )
}
