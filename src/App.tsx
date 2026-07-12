import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppStore } from './store/appStore'
import { useAuthStore } from './store/authStore'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './components/layout/DashboardLayout'
import FindStoresPage from './pages/FindStoresPage'
import WizardPage from './pages/WizardPage'
import HistoryPage from './pages/HistoryPage'
import ScriptPage from './pages/ScriptPage'
import FavoritesPage from './pages/FavoritesPage'
import ProjectsPage from './pages/ProjectsPage'
import ContractsPage from './pages/ContractsPage'
import ProposalsPage from './pages/ProposalsPage'
import BudgetsPage from './pages/BudgetsPage'
import BriefingsPage from './pages/BriefingsPage'
import PlansPage from './pages/PlansPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const location = useLocation()
  const theme = useAppStore((s) => s.theme)
  const language = useAppStore((s) => s.language)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      root.classList.toggle('dark', mq.matches)
      const handler = (e: MediaQueryListEvent) => root.classList.toggle('dark', e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'pt-BR'
  }, [language])

  return (
    <AnimatePresence mode="wait">
      <Toaster richColors position="top-right" />
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="find-stores" element={<FindStoresPage />} />
          <Route path="wizard" element={<WizardPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="script" element={<ScriptPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="proposals" element={<ProposalsPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="briefings" element={<BriefingsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}