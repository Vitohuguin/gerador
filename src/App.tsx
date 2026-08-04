import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { useAppStore } from './store/appStore'
import { useAuthStore } from './store/authStore'
import DashboardLayout from './components/layout/DashboardLayout'

// Lazy loading — cada página só baixa quando o usuário acessa (reduz bundle inicial)
const LandingPage = lazy(() => import('./pages/LandingPage'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const FindStoresPage = lazy(() => import('./pages/FindStoresPage'))
const WizardPage = lazy(() => import('./pages/WizardPage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const ScriptPage = lazy(() => import('./pages/ScriptPage'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const ContractsPage = lazy(() => import('./pages/ContractsPage'))
const ProposalsPage = lazy(() => import('./pages/ProposalsPage'))
const BudgetsPage = lazy(() => import('./pages/BudgetsPage'))
const BriefingsPage = lazy(() => import('./pages/BriefingsPage'))
const PlansPage = lazy(() => import('./pages/PlansPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
    </div>
  )
}

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>
}

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
        <Route path="/" element={withSuspense(<LandingPage />)} />
        <Route path="/login" element={withSuspense(<Login />)} />
        <Route path="/register" element={withSuspense(<Register />)} />
        <Route path="/reset-password" element={withSuspense(<ResetPassword />)} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={withSuspense(<Dashboard />)} />
          <Route path="find-stores" element={withSuspense(<FindStoresPage />)} />
          <Route path="wizard" element={withSuspense(<WizardPage />)} />
          <Route path="history" element={withSuspense(<HistoryPage />)} />
          <Route path="script" element={withSuspense(<ScriptPage />)} />
          <Route path="favorites" element={withSuspense(<FavoritesPage />)} />
          <Route path="projects" element={withSuspense(<ProjectsPage />)} />
          <Route path="contracts" element={withSuspense(<ContractsPage />)} />
          <Route path="proposals" element={withSuspense(<ProposalsPage />)} />
          <Route path="budgets" element={withSuspense(<BudgetsPage />)} />
          <Route path="briefings" element={withSuspense(<BriefingsPage />)} />
          <Route path="plans" element={withSuspense(<PlansPage />)} />
          <Route path="profile" element={withSuspense(<ProfilePage />)} />
          <Route path="settings" element={withSuspense(<SettingsPage />)} />
          <Route path="admin" element={withSuspense(<AdminRoute><AdminPage /></AdminRoute>)} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}