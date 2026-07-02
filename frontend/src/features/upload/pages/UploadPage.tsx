import { useState, useRef, useCallback } from 'react'
import { Upload as UploadIcon, File, Trash2, Eye, FileText, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useDocuments } from '@/hooks/useDocuments'
import { useToast } from '@/context/ToastContext'
import { getDocumentDownloadUrl } from '@/lib/api/documents'
import { storage } from '@/lib/storage'
import { SkeletonTable } from '@/components/ui/Skeleton'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

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
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'UPLOADED':
      return <Badge variant="blue">Uploaded</Badge>
    case 'PROCESSING':
      return <Badge variant="amber">Processing</Badge>
    case 'ANALYZED':
      return <Badge variant="green">Analyzed</Badge>
    case 'ERROR':
      return <Badge variant="red">Error</Badge>
    default:
      return <Badge variant="gray">{status}</Badge>
  }
}

export function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState<{ name: string; progress: number } | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { documents, isLoading, upload, remove } = useDocuments()
  const { showToast } = useToast()

  const validateAndUpload = useCallback(async (file: File) => {
    // Client-side validation
    if (file.type !== 'application/pdf') {
      showToast('Only PDF files are supported. Please select a .pdf file.', 'error')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast(`File size (${formatFileSize(file.size)}) exceeds the 20 MB limit.`, 'error')
      return
    }

    try {
      setUploading({ name: file.name, progress: 0 })
      await upload(file, (progress) => {
        setUploading({ name: file.name, progress })
      })
      setUploading(null)
    } catch {
      setUploading(null)
    }
  }, [upload, showToast])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragover' || e.type === 'dragenter')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await validateAndUpload(file)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await validateAndUpload(file)
    // Reset input so the same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      await remove(id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleView = (id: number) => {
    const url = getDocumentDownloadUrl(id)
    const token = storage.getToken()
    // Open PDF in a new tab using fetch + blob for authenticated download
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load document')
        return res.blob()
      })
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob)
        window.open(blobUrl, '_blank')
      })
      .catch(() => {
        showToast('Failed to open document', 'error')
      })
  }

  if (isLoading && documents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload and manage your legal documents.
          </p>
        </div>
        <SkeletonTable />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload and manage your legal documents.
            {documents.length > 0 && (
              <span className="ml-1 font-medium text-gray-800 dark:text-gray-200">
                {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <Card>
        <div
          onDragOver={handleDrag}
          onDragEnter={handleDrag}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 scale-[1.01]'
              : 'border-gray-300 dark:border-gray-600 hover:border-brand-300 hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              dragActive
                ? 'bg-brand-200 dark:bg-brand-800/40 scale-110'
                : 'bg-brand-100 dark:bg-brand-900/30'
            }`}>
              <UploadIcon size={28} className="text-brand-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {dragActive ? 'Drop your PDF here' : 'Drag & drop your contract'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                or click to browse from your computer
              </p>
            </div>
            <Button
              variant="primary"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              disabled={!!uploading}
            >
              Browse Files
            </Button>
            <div className="flex gap-3 mt-2 items-center">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold border border-red-200/50 dark:border-red-800/30">
                PDF
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Maximum file size: 20 MB
              </span>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                  <File size={16} className="text-brand-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-semibold truncate">{uploading.name}</div>
                  <div className="text-xs text-gray-500">
                    {uploading.progress < 100 ? 'Uploading...' : 'Processing...'}
                  </div>
                </div>
                <span className="text-sm font-bold text-brand-600">{uploading.progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploading.progress}%` }}
                />
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
          />
        </div>
      </Card>

      {/* Documents Table */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <FileText size={20} className="text-gray-500" />
            Your Documents
          </h2>
          {documents.length > 0 && (
            <span className="text-xs text-gray-500 font-medium">
              {documents.length} total
            </span>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <FileText size={52} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-1">No documents yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload your first PDF to get started with document management.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    File Name
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Upload Date
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    File Size
                  </th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3 px-5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/15 flex items-center justify-center flex-shrink-0">
                          <File size={18} className="text-red-500 dark:text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate max-w-[240px]">{doc.originalFileName}</div>
                          <div className="text-xs text-gray-500 sm:hidden mt-0.5">
                            {formatDate(doc.uploadedAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="py-3.5 px-5 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="py-3.5 px-5">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(doc.id)}
                          title="View PDF"
                        >
                          <Eye size={15} className="mr-1" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete document"
                        >
                          {deletingId === doc.id ? (
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                            </span>
                          ) : (
                            <>
                              <Trash2 size={15} className="mr-1" /> Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Info Banner */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/15 border border-blue-200/50 dark:border-blue-800/30 rounded-xl text-sm">
        <AlertCircle size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-blue-700 dark:text-blue-300">
          <span className="font-semibold">Coming soon:</span> AI-powered contract analysis, clause extraction,
          risk scoring, and document comparison will be available in future updates.
        </div>
      </div>
    </div>
  )
}
