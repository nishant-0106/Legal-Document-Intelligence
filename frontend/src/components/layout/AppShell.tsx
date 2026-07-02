import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const pageTitle: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/upload': 'Documents',
  '/analysis': 'Contract Analysis',
  '/chat': 'AI Legal Chat',
  '/compare': 'Compare Contracts',
  '/settings': 'Settings',
}

export function AppShell() {
  const location = useLocation()
  const title = pageTitle[location.pathname] || 'Dashboard'

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar title={title} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
