import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ThemeProvider } from './contexts/ThemeContext'
import { I18nProvider } from './i18n'
import { Layout } from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Experiments from './pages/Experiments'
import Scenarios from './pages/Scenarios'
import IdsProfiles from './pages/IdsProfiles'
import Alerts from './pages/Alerts'
import RunDetail from './pages/RunDetail'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 15_000 } },
})

function PrivateLayout() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Layout><Outlet /></Layout>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={<PrivateLayout />}>
                  <Route path="/"             element={<Dashboard />} />
                  <Route path="experiments"   element={<Experiments />} />
                  <Route path="scenarios"     element={<Scenarios />} />
                  <Route path="ids-profiles"  element={<IdsProfiles />} />
                  <Route path="alerts"        element={<Alerts />} />
                  <Route path="runs/:runId"   element={<RunDetail />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}
