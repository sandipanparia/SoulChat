import { Link, NavLink, Outlet } from 'react-router-dom'
import { HeartHandshake, User } from 'lucide-react'
import { useMemo } from 'react'

export function MainLayout({ isAuthenticated, onLogout }) {
  const navClasses = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive ? 'bg-white/70 text-soul-text shadow-soft' : 'text-soul-muted hover:bg-white/60'
    }`

  const user = useMemo(() => {
    if (!isAuthenticated) return null
    try {
      return JSON.parse(localStorage.getItem('soulchat-user'))
    } catch {
      return null
    }
  }, [isAuthenticated])

  const initials = useMemo(() => {
    if (!user?.fullName) return <User size={16} />
    const parts = user.fullName.split(' ')
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }, [user])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-8 lg:px-10">
      <header className="glass-card sticky top-4 z-30 mb-8 flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
        <Link to={isAuthenticated ? "/home" : "/"} className="flex items-center gap-2 text-soul-text">
          <HeartHandshake className="h-5 w-5 text-violet-500" />
          <span className="text-lg font-semibold">Soul Chat</span>
        </Link>
        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NavLink to="/home" className={navClasses}>
                Home
              </NavLink>
              <Link
                to="/dashboard"
                className="rounded-full bg-soul-text px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2f283c]"
              >
                App
              </Link>
              {user && (
                <div 
                  className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-violet-200 to-pink-200 text-sm font-semibold text-violet-700 shadow-soft"
                  title={user.email}
                >
                  {initials}
                </div>
              )}
              <button
                onClick={onLogout}
                className="ml-1 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-semibold text-soul-text transition hover:bg-white"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/auth" className={navClasses}>
              Login
            </NavLink>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
