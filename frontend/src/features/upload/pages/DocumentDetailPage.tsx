import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  File,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Hash,
  User,
  BookOpen,
  Calendar,
  Copy,
  Check,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useDocuments } from '@/hooks/useDocuments'
import type { ProcessingStatus } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

// ─── Processing Status UI ─────────────────────────────────────────────────────

interface StatusConfig {
  label: string
  badgeVariant: 'blue' | 'amber' | 'green' | 'red' | 'gray'
  icon: React.ReactNode
  description: string
}

function getStatusConfig(status: ProcessingStatus | string | undefined): StatusConfig {
  switch (status) {
    case 'PROCESSING':
      return {
        label: 'Processing',
        badgeVariant: 'amber',
        icon: <Loader2 size={16} className="animate-spin" />,
        description: 'PDF text and metadata extraction is in progress…',
      }
    case 'PROCESSED':
      return {
        label: 'Processed',
        badgeVariant: 'green',
        icon: <CheckCircle2 size={16} />,
        description: 'Text and metadata have been successfully extracted.',
      }
    case 'FAILED':
      return {
        label: 'Failed',
        badgeVariant: 'red',
        icon: <AlertCircle size={16} />,
        description:
          'PDF processing failed. The file may be password-protected or corrupted.',
      }
    case 'UPLOADED':
    default:
      return {
        label: 'Uploaded',
        badgeVariant: 'blue',
        icon: <Clock size={16} />,
        description: 'Document uploaded. Processing will begin shortly.',
      }
  }
}

// ─── Copy-to-clipboard button ─────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} title="Copy text">
      {copied ? (
        <>
          <Check size={14} className="mr-1 text-green-500" /> Copied
        </>
      ) : (
        <>
          <Copy size={14} className="mr-1" /> Copy
        </>
      )}
    </Button>
  )
}

// ─── Metadata row ─────────────────────────────────────────────────────────────

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number | null | undefined
}) {
  const display = value !== null && value !== undefined && value !== '' ? String(value) : '—'
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-gray-500 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</div>
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 break-words">
          {display}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fetch, current, isLoading } = useDocuments()

  const documentId = id ? parseInt(id, 10) : null

  useEffect(() => {
    if (documentId && !isNaN(documentId)) {
      fetch(documentId)
    }
  }, [documentId, fetch])

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/upload')} className="gap-2">
          <ArrowLeft size={16} /> Back to Documents
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!current && !isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/upload')} className="gap-2">
          <ArrowLeft size={16} /> Back to Documents
        </Button>
        <Card className="text-center py-16">
          <FileText size={52} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="font-bold text-gray-700 dark:text-gray-300 mb-1">Document not found</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This document may have been deleted or doesn't belong to your account.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => navigate('/upload')}>
            Back to Documents
          </Button>
        </Card>
      </div>
    )
  }

  const doc = current!
  const statusConfig = getStatusConfig(doc.processingStatus)
  const hasText = doc.processingStatus === 'PROCESSED' && doc.extractedText
  const hasFailed = doc.processingStatus === 'FAILED'
  const isProcessing = doc.processingStatus === 'PROCESSING'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/upload')}
            className="gap-2 flex-shrink-0"
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate" title={doc.originalFileName}>
              {doc.originalFileName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Document ID: #{doc.id}
            </p>
          </div>
        </div>
        <Badge variant={statusConfig.badgeVariant} className="flex items-center gap-1.5 self-start sm:self-auto">
          {statusConfig.icon}
          {statusConfig.label}
        </Badge>
      </div>

      {/* Processing status banner */}
      {isProcessing && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/15 border border-amber-200/50 dark:border-amber-700/30 rounded-xl text-sm">
          <Loader2 size={18} className="text-amber-500 animate-spin flex-shrink-0" />
          <span className="text-amber-700 dark:text-amber-300">
            <span className="font-semibold">Processing…</span> PDF text and metadata extraction is running. Refresh in a moment.
          </span>
        </div>
      )}

      {hasFailed && (
        <div className="flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/15 border border-red-200/50 dark:border-red-700/30 rounded-xl text-sm">
          <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-red-700 dark:text-red-300">
            <span className="font-semibold">Processing failed.</span>{' '}
            The PDF could not be read — it may be password-protected or corrupted. You can still download the original file.
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: File info + PDF Metadata */}
        <div className="space-y-6">

          {/* File Info */}
          <Card>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2">
              <File size={17} className="text-gray-500" />
              File Information
            </h2>
            <MetaRow icon={<Hash size={14} />} label="File Size" value={formatFileSize(doc.fileSize)} />
            <MetaRow icon={<Calendar size={14} />} label="Uploaded At" value={formatDate(doc.uploadedAt)} />
            <MetaRow icon={<File size={14} />} label="Content Type" value={doc.contentType} />
            {doc.processedAt && (
              <MetaRow
                icon={<CheckCircle2 size={14} />}
                label="Processed At"
                value={formatDate(doc.processedAt)}
              />
            )}
          </Card>

          {/* PDF Metadata */}
          <Card>
            <h2 className="font-bold text-base mb-3 flex items-center gap-2">
              <BookOpen size={17} className="text-gray-500" />
              PDF Metadata
            </h2>
            {isProcessing ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <MetaRow
                  icon={<Hash size={14} />}
                  label="Pages"
                  value={doc.pageCount ?? (hasFailed ? 'N/A' : '—')}
                />
                <MetaRow
                  icon={<BookOpen size={14} />}
                  label="Title"
                  value={doc.pdfTitle}
                />
                <MetaRow
                  icon={<User size={14} />}
                  label="Author"
                  value={doc.pdfAuthor}
                />
                <MetaRow
                  icon={<Calendar size={14} />}
                  label="Creation Date"
                  value={doc.pdfCreationDate ? formatDate(doc.pdfCreationDate) : null}
                />
              </>
            )}
          </Card>
        </div>

        {/* Right: Extracted Text */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-base flex items-center gap-2">
                <FileText size={17} className="text-gray-500" />
                Extracted Text
                {hasText && doc.extractedText && (
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    ({doc.extractedText.length.toLocaleString()} chars)
                  </span>
                )}
              </h2>
              {hasText && doc.extractedText && (
                <CopyButton text={doc.extractedText} />
              )}
            </div>

            {/* Loading */}
            {isProcessing && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 size={36} className="text-brand-500 animate-spin mb-4" />
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Extracting text from PDF…
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  This usually takes a few seconds.
                </p>
              </div>
            )}

            {/* Failed */}
            {hasFailed && (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-red-200 dark:border-red-800/40 rounded-xl">
                <AlertCircle size={40} className="text-red-400 mb-4" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Text extraction failed
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs leading-relaxed">
                  The PDF may be password-protected or the file may be corrupted. You can still view the original file using the download button.
                </p>
              </div>
            )}

            {/* Uploaded / not yet processed */}
            {!isProcessing && !hasFailed && !hasText && (
              <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                <Clock size={40} className="text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  No text extracted yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Processing will begin automatically after upload.
                </p>
              </div>
            )}

            {/* Extracted text */}
            {hasText && (
              <div
                className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 overflow-y-auto font-mono text-xs leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words border border-gray-200 dark:border-gray-700"
                style={{ maxHeight: '520px' }}
              >
                {doc.extractedText}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
