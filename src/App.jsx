import { useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { AppShellLayout } from './components/layout/AppShellLayout'
import { LandingHomePage } from './pages/LandingHomePage'
import { HomePage } from './pages/HomePage'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { CreateAvatarPage } from './pages/CreateAvatarPage'
import { ChatPage } from './pages/ChatPage'

const AUTH_KEY = 'soulchat-auth'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(AUTH_KEY) === 'true',
  )

  const authActions = useMemo(
    () => ({
      login: () => {
        localStorage.setItem(AUTH_KEY, 'true')
        setIsAuthenticated(true)
      },
      logout: () => {
        localStorage.removeItem(AUTH_KEY)
        setIsAuthenticated(false)
      },
    }),
    [],
  )

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingHomePage />} />

      {/* Auth */}
      <Route
        path="/auth"
        element={<AuthPage onAuthSuccess={authActions.login} redirectTo="/home" />}
      />

      {/* Authenticated routes with main layout */}
      <Route
        element={<MainLayout isAuthenticated={isAuthenticated} onLogout={authActions.logout} />}
      >
        <Route
          path="/home"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/auth" replace />}
        />
      </Route>

      {/* App shell routes */}
      <Route element={<AppShellLayout onLogout={authActions.logout} />}>
        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/create-avatar"
          element={isAuthenticated ? <CreateAvatarPage /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/chat/:avatarId"
          element={isAuthenticated ? <ChatPage /> : <Navigate to="/auth" replace />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
