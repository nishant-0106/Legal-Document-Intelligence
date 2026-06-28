import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, FileText, MessageSquare } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { register, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await register({ firstName, lastName, email, password })
  }

  const features = [
    { icon: Shield, title: 'Risk Detection', desc: 'Automatically identify high-risk clauses' },
    { icon: FileText, title: 'Contract Analysis', desc: 'AI-powered summaries with recommendations' },
    { icon: MessageSquare, title: 'Legal AI Chat', desc: 'Ask questions and get instant insights' },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white flex-col items-center justify-center px-12 py-12">
        <div className="max-w-sm text-center space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-brand-400/10 border border-brand-400/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-sm font-medium text-brand-100">AI-Powered Legal Intelligence</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight">
            Understand your contracts instantly
          </h1>
          <p className="text-lg text-brand-100">
            LexIntel AI scans, analyzes, and flags legal risks in seconds.
          </p>

          <div className="space-y-4 pt-8">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <Icon size={24} className="text-brand-300 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-semibold text-white">{title}</div>
                  <div className="text-sm text-brand-100">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-brand-200 pt-8">
            <div className="font-semibold mb-2">Why 2,400+ teams trust LexIntel</div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>📊 98% Accuracy</div>
              <div>⚡ &lt;30s Analysis</div>
              <div>🔒 SOC 2 Certified</div>
              <div>🌍 Global Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                ⚖️
              </div>
              <div>
                <div className="font-bold">LexIntel</div>
                <div className="text-xs text-gray-500">Legal Intelligence</div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-2">Create your account</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started with LexIntel AI free today
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button isLoading={isLoading} fullWidth type="submit" className="mt-6">
              Create free account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
