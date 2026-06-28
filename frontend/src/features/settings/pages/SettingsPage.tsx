import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useToast } from '@/context/ToastContext'

export function SettingsPage() {
  const { user: currentUser, updateUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const { showToast } = useToast()
  const [tab, setTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    company: currentUser?.company || '',
    role: currentUser?.role || '',
  })
  const [toggles, setToggles] = useState({
    emailNotif: true,
    slackNotif: false,
    weeklyDigest: true,
    highRiskAlerts: true,
  })

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'appearance', label: 'Appearance' },
  ]

  const handleSave = () => {
    updateUser({ name: formData.name, email: formData.email } as any)
    showToast('Profile saved successfully', 'success')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar nav */}
      <div className="hidden lg:block">
        <Card>
          <nav className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </Card>
      </div>

      {/* Content */}
      <div className="lg:col-span-3">
        {/* Profile */}
        {tab === 'profile' && (
          <Card>
            <h2 className="text-lg font-bold mb-6">Profile Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xl">
                  {currentUser?.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{currentUser?.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{currentUser?.email}</div>
                </div>
              </div>

              <Input
                label="Full name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              />
              <Input
                label="Company"
                value={formData.company}
                onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
              />
              <Input
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
              />

              <Button variant="primary" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </Card>
        )}

        {/* Security */}
        {tab === 'security' && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-bold mb-6">Change Password</h2>
              <div className="space-y-4">
                <Input label="Current password" type="password" placeholder="••••••••" />
                <Input label="New password" type="password" placeholder="Min. 8 characters" />
                <Input label="Confirm password" type="password" placeholder="Repeat password" />
                <Button variant="primary">Update Password</Button>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-bold mb-4">Two-Factor Authentication</h2>
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div>
                  <div className="font-semibold">Authenticator app</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Use Google Authenticator or similar
                  </div>
                </div>
                <span className="badge badge-green">Enabled</span>
              </div>
            </Card>
          </div>
        )}

        {/* Notifications */}
        {tab === 'notifications' && (
          <Card>
            <h2 className="text-lg font-bold mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { key: 'emailNotif', label: 'Email notifications', desc: 'Receive alerts and summaries' },
                { key: 'slackNotif', label: 'Slack integration', desc: 'Post risk alerts to Slack' },
                { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Summary each Monday' },
                { key: 'highRiskAlerts', label: 'High-risk alerts', desc: 'Instant alert for risk 70+' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div>
                    <div className="font-semibold text-sm">{label}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{desc}</div>
                  </div>
                  <button
                    onClick={() => setToggles((p) => ({ ...p, [key]: !p[key as keyof typeof toggles] }))}
                    className={`toggle-track ${toggles[key as keyof typeof toggles] ? 'on' : ''}`}
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Appearance */}
        {tab === 'appearance' && (
          <Card>
            <h2 className="text-lg font-bold mb-6">Appearance</h2>
            <div>
              <div className="text-sm font-semibold mb-3">Theme</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'Light', emoji: '☀️' },
                  { id: 'dark', label: 'Dark', emoji: '🌙' },
                  { id: 'system', label: 'System', emoji: '💻' },
                ].map(({ id, label, emoji }) => (
                  <button
                    key={id}
                    onClick={() => setTheme(id as any)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === id
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{emoji}</div>
                    <div className={`text-sm font-semibold ${theme === id ? 'text-brand-600' : ''}`}>
                      {label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
