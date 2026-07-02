import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Upload, FileText, Clock, ArrowRight, Shield } from 'lucide-react'
import { useDocuments } from '@/hooks/useDocuments'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function DashboardPage() {
  const { user } = useAuth()
  const { documents, isLoading, fetchAll } = useDocuments()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Compute stats dynamically from real documents
  const totalDocs = documents.length
  const analyzedDocs = documents.filter((d) => d.risk > 0).length
  const highRiskDocs = documents.filter((d) => d.risk >= 70).length
  const avgRisk = totalDocs > 0
    ? Math.round(documents.reduce((sum, d) => sum + d.risk, 0) / totalDocs)
    : 0

  const dashboardStats = [
    {
      label: 'Total Documents',
      value: String(totalDocs),
      change: totalDocs > 0 ? `${totalDocs} uploaded` : 'No documents yet',
      trend: 'up' as const,
      icon: '📄',
      color: '#E6F1FB',
      iconColor: '#185FA5',
    },
    {
      label: 'Analyses Run',
      value: String(analyzedDocs),
      change: analyzedDocs > 0 ? `${analyzedDocs} analyzed` : 'None yet',
      trend: 'up' as const,
      icon: '⚙️',
      color: '#E1F5EE',
      iconColor: '#0F6E56',
    },
    {
      label: 'Risk Alerts',
      value: String(highRiskDocs),
      change: highRiskDocs > 0 ? `${highRiskDocs} high-risk` : 'No alerts',
      trend: 'down' as const,
      icon: '⚠️',
      color: '#FCEBEB',
      iconColor: '#A32D2D',
    },
    {
      label: 'Avg. Risk Score',
      value: String(avgRisk),
      change: totalDocs > 0 ? `Across ${totalDocs} docs` : 'N/A',
      trend: 'up' as const,
      icon: '🛡️',
      color: '#FAEEDA',
      iconColor: '#854F0B',
    },
  ]

  // Get risk level color helper
  const getRiskBadgeVariant = (score: number) => {
    if (score >= 70) return 'red'
    if (score >= 40) return 'amber'
    return 'green'
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's the summary of your legal documents and risk analyses.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/upload')}>
          <Upload size={16} className="mr-2" /> Upload Contract
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: stat.color, color: stat.iconColor }}
            >
              {stat.icon}
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</div>
              <div className="text-2xl font-bold mt-0.5">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <span className={stat.trend === 'up' && stat.label.includes('Risk') ? 'text-red-500 font-medium' : 'text-emerald-500 font-medium'}>
                  {stat.change}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Documents */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Recent Documents</h2>
              <Link to="/upload" className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No documents found. Start by uploading one!</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/upload')}>
                  Upload Document
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{doc.name}</div>
                        <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
                          <span>{doc.date}</span>
                          <span>•</span>
                          <span>{doc.pages} pages</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getRiskBadgeVariant(doc.risk)}>
                        {doc.risk}% Risk
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => navigate('/analysis')}>
                        Analyze
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Activity and Actions */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock size={18} className="text-gray-500" />
              Recent Activity
            </h2>
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No activity yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Upload a document to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-brand-600 mt-2 flex-shrink-0" />
                    <div>
                      <div className="text-gray-800 dark:text-gray-200">
                        <span className="font-semibold">{user?.name.split(' ')[0]}</span>: uploaded{' '}
                        <span className="font-medium text-gray-900 dark:text-white">"{doc.name}"</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{doc.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="bg-brand-900 text-white relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
              <Shield size={200} />
            </div>
            <h3 className="font-bold text-lg mb-2">Need a fast check?</h3>
            <p className="text-xs text-brand-100 mb-4 leading-relaxed">
              LexIntel AI can run a full risk audit on NDAs, service agreements, and SaaS licenses. Check for auto-renewals, high-risk liability limits, and more in seconds.
            </p>
            <Button
              className="bg-white text-brand-900 hover:bg-brand-50 border-none font-semibold text-xs py-2 px-4 rounded-lg flex items-center gap-2"
              onClick={() => navigate('/upload')}
            >
              Analyze New Contract <ArrowRight size={14} />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
