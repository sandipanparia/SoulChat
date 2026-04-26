import { useTheme } from '../../utils/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle({ size = 18 }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      id="theme-toggle-btn"
    >
      <span className={`theme-toggle__icon ${isDark ? 'theme-toggle__icon--hidden' : ''}`}>
        <Moon size={size} />
      </span>
      <span className={`theme-toggle__icon ${!isDark ? 'theme-toggle__icon--hidden' : ''}`}>
        <Sun size={size} />
      </span>
    </button>
  )
}
