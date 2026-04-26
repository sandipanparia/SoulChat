import { Link, NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, MessageCircleHeart, Sparkles } from 'lucide-react'

export function AppShellLayout({ onLogout }) {
  const navClasses = ({ isActive }) =>
    `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
      isActive ? 'bg-white/80 text-soul-text shadow-soft' : 'text-soul-muted hover:bg-white/60'
    }`

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-10 pt-6 sm:px-8 lg:px-10">
      <header className="glass-card mb-8 flex flex-col gap-4 rounded-3xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link to="/dashboard" className="text-2xl font-semibold tracking-tight text-soul-text">
          Soul Chat
        </Link>
        <nav className="flex flex-wrap gap-2">
          <NavLink to="/dashboard" className={navClasses}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </NavLink>
          <NavLink to="/create-avatar" className={navClasses}>
            <Sparkles className="h-4 w-4" /> Create Avatar
          </NavLink>
          <NavLink to="/chat/mother-amara" className={navClasses}>
            <MessageCircleHeart className="h-4 w-4" /> Chat
          </NavLink>
          <button
            onClick={onLogout}
            className="rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm font-semibold text-soul-text transition hover:bg-white"
          >
            Logout
          </button>
        </nav>
      </header>
      <Outlet />
    </div>
  )
}
