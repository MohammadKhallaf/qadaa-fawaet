import type { ReactNode } from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import WizardScreen from './screens/WizardScreen'
import DashboardScreen from './screens/DashboardScreen'
import StatsScreen from './screens/StatsScreen'
import SettingsScreen from './screens/SettingsScreen'

function RootRedirect() {
  // Will read from store in Task 4; hardcode to /wizard for now
  return <Navigate to="/wizard" replace />
}

function RequireWizard({ children }: { children: ReactNode }) {
  // Will guard with store in Task 4; pass-through for now
  return <>{children}</>
}

const router = createBrowserRouter([
  { path: '/',          element: <RootRedirect /> },
  { path: '/wizard',    element: <WizardScreen /> },
  { path: '/dashboard', element: <RequireWizard><DashboardScreen /></RequireWizard> },
  { path: '/stats',     element: <RequireWizard><StatsScreen /></RequireWizard> },
  { path: '/settings',  element: <SettingsScreen /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
