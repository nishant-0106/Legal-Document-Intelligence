import { Bell, Search, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useToast } from '@/context/ToastContext'

interface TopbarProps {
  title?: string
}

export function Topbar({ title = '' }: TopbarProps) {
  const { user: currentUser } = useAuth()
  const { isDark, toggleDarkMode } = useTheme()
  const { showToast } = useToast()

  return (
    <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center px-6 justify-between sticky top-0 z-40">
      {/* Left: Title */}
      <div className="text-sm font-semibold text-gray-900 dark:text-white">{title}</div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 w-48">
          <Search size={14} className="text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder-gray-500 dark:placeholder-gray-400 dark:text-white"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? (
            <Sun size={16} className="text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon size={16} className="text-gray-600 dark:text-gray-400" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={() => showToast('No new notifications', 'info')}
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Bell size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center
                       text-white text-xs font-bold cursor-pointer"
          >
            {currentUser?.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
}
