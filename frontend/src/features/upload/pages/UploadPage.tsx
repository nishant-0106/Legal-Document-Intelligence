import { useState, useRef } from 'react'
import { Upload as UploadIcon, File, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useDocuments } from '@/hooks/useDocuments'
import { useToast } from '@/context/ToastContext'
import { SkeletonTable } from '@/components/ui/Skeleton'

export function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState<{ name: string; progress: number } | null>(null)
  const { documents, isLoading, upload, remove } = useDocuments()
  const { showToast } = useToast()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(e.type !== 'dragleave')
  }

  const handleUpload = async (file: File) => {
    if (!file.type.includes('pdf') && !file.type.includes('word') && !file.type.includes('document')) {
      showToast('Only PDF and DOCX files are supported', 'error')
      return
    }

    try {
      await upload(file, (progress) => {
        setUploading({ name: file.name, progress })
      })
      setUploading(null)
    } catch {
      setUploading(null)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) await handleUpload(file)
  }

  if (isLoading) {
    return <SkeletonTable />
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <Card>
        <div
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-brand-300'
          }`}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <UploadIcon size={24} className="text-brand-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Drop your contract here</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                or click to browse from your computer
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse files
            </Button>
            <div className="flex gap-2 mt-4">
              {['PDF', 'DOCX', 'DOC', 'TXT'].map((fmt) => (
                <span key={fmt} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          {uploading && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold mb-2">{uploading.name}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 transition-all"
                    style={{ width: `${uploading.progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold">{uploading.progress}%</span>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
            }}
          />
        </div>
      </Card>

      {/* Files list */}
      <Card>
        <h3 className="text-sm font-bold mb-4">Recent Uploads</h3>
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <File size={20} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{doc.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{doc.size} • {doc.date}</div>
              </div>
              <Badge variant={doc.risk < 40 ? 'green' : doc.risk < 70 ? 'amber' : 'red'}>
                Risk: {doc.risk}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(doc.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
