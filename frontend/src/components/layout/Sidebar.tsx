import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Upload, FileText, MessageSquare,
  GitCompare, Settings, LogOut,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/upload', label: 'Documents', icon: Upload },
  { path: '/analysis', label: 'Analysis', icon: FileText },
  { path: '/chat', label: 'AI Legal Chat', icon: MessageSquare, badge: 3 },
  { path: '/compare', label: 'Compare Contracts', icon: GitCompare },
]

export function Sidebar() {
  const location = useLocation()
  const navigate  = useNavigate()
  const { user: currentUser, logout } = useAuth()

  return (
    <div className="w-56 bg-gradient-to-b from-brand-900 to-brand-800 h-screen flex flex-col text-white overflow-hidden">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-brand-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-400 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-brand-900">⚖️</span>
          </div>
          <div>
            <div className="font-bold text-sm">LexIntel AI</div>
            <div className="text-xs text-brand-200">Legal Intelligence</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-brand-200 mb-2">
          Main
        </div>
        {navItems.map(({ path, label, icon: Icon, badge }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`nav-item w-full text-left ${
              location.pathname === path ? 'active' : ''
            }`}
          >
            <Icon size={16} />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                {badge}
              </span>
            )}
          </button>
        ))}

        <div className="px-2 py-3 text-xs font-bold uppercase tracking-wider text-brand-200 mt-6 mb-2">
          Account
        </div>
        <button
          onClick={() => navigate('/settings')}
          className={`nav-item w-full text-left ${
            location.pathname === '/settings' ? 'active' : ''
          }`}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-brand-700/50 space-y-2">
        <div className="px-2 py-2">
          <div className="text-sm font-semibold">{currentUser?.name}</div>
          <div className="text-xs text-brand-200">{currentUser?.role}</div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
                   text-brand-200 hover:bg-brand-700/50 transition-colors text-sm"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )
}
