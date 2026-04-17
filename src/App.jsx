import { useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthenticatedLayout } from './components/layout/AuthenticatedLayout'
import { LandingHomePage } from './pages/LandingHomePage'
import { HomePage } from './pages/HomePage'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { CreateAvatarPage } from './pages/CreateAvatarPage'
import { ChatPage } from './pages/ChatPage'
import { ProfilePage } from './pages/ProfilePage'

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

      {/* Home — full-page layout matching landing theme */}
      <Route
        path="/home"
        element={isAuthenticated ? <HomePage onLogout={authActions.logout} /> : <Navigate to="/auth" replace />}
      />

      {/* Authenticated routes — same theme as landing/home */}
      <Route element={<AuthenticatedLayout onLogout={authActions.logout} />}>
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
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage onLogout={authActions.logout} /> : <Navigate to="/auth" replace />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
