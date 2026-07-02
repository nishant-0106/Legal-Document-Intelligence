import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Upload, FileText, Clock, ArrowRight, Shield } from 'lucide-react'
import { useDocuments } from '@/hooks/useDocuments'
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

function formatDate(iso: string): string {
  try {
    const date = new Date(iso)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function timeAgo(iso: string): string {
  try {
    const now = Date.now()
    const then = new Date(iso).getTime()
    const diffMs = now - then
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay < 7) return `${diffDay}d ago`
    return formatDate(iso)
  } catch {
    return iso
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'UPLOADED': return 'blue'
    case 'PROCESSING': return 'amber'
    case 'ANALYZED': return 'green'
    case 'ERROR': return 'red'
    default: return 'gray' as const
  }
}

export function DashboardPage() {
  const { user } = useAuth()
  const { documents, isLoading, fetchAll } = useDocuments()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Compute stats dynamically from real documents
  const totalDocs = documents.length
  const uploadedDocs = documents.filter((d) => d.status === 'UPLOADED').length
  const analyzedDocs = documents.filter((d) => d.status === 'ANALYZED').length
  const totalSizeMB = totalDocs > 0
    ? (documents.reduce((sum, d) => sum + d.fileSize, 0) / (1024 * 1024)).toFixed(1)
    : '0'

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
      label: 'Pending Analysis',
      value: String(uploadedDocs),
      change: uploadedDocs > 0 ? `${uploadedDocs} awaiting` : 'None pending',
      trend: 'up' as const,
      icon: '⏳',
      color: '#E1F5EE',
      iconColor: '#0F6E56',
    },
    {
      label: 'Analyzed',
      value: String(analyzedDocs),
      change: analyzedDocs > 0 ? `${analyzedDocs} completed` : 'None yet',
      trend: 'up' as const,
      icon: '✅',
      color: '#FAEEDA',
      iconColor: '#854F0B',
    },
    {
      label: 'Storage Used',
      value: `${totalSizeMB} MB`,
      change: totalDocs > 0 ? `Across ${totalDocs} files` : 'N/A',
      trend: 'up' as const,
      icon: '💾',
      color: '#FCEBEB',
      iconColor: '#A32D2D',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name.split(' ')[0]}!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's the summary of your legal documents.
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
                <span className="text-emerald-500 font-medium">
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
                      <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500 dark:text-red-400">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm truncate max-w-[240px]">{doc.originalFileName}</div>
                        <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
                          <span>{formatDate(doc.uploadedAt)}</span>
                          <span>•</span>
                          <span>{formatFileSize(doc.fileSize)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusBadgeVariant(doc.status) as any}>
                        {doc.status}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => navigate('/upload')}>
                        Manage
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
                        <span className="font-medium text-gray-900 dark:text-white">"{doc.originalFileName}"</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">{timeAgo(doc.uploadedAt)}</div>
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
              Upload New Contract <ArrowRight size={14} />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
