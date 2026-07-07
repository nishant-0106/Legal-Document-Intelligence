// ─── Auth ────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  name: string
  email: string
  role: string
  company: string
  avatar: string | null
}

export interface AuthTokens {
  token: string
  user: User
}

// ─── Documents ───────────────────────────────────────────────────────────────
export type DocumentStatus = 'UPLOADED' | 'PROCESSING' | 'ANALYZED' | 'ERROR'

/** Processing pipeline status returned after PDF extraction. */
export type ProcessingStatus = 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED'

export interface Document {
  id: number
  originalFileName: string
  fileSize: number              // bytes
  contentType: string
  status: DocumentStatus
  uploadedAt: string            // ISO datetime from backend

  // ─── PDF processing fields (populated after extraction) ───────────────────
  processingStatus?: ProcessingStatus
  pageCount?: number
  pdfTitle?: string
  pdfAuthor?: string
  pdfCreationDate?: string
  extractedText?: string
  processedAt?: string          // ISO datetime
}

/** Response from GET /api/v1/documents/{id}/text */
export interface DocumentText {
  documentId: number
  processingStatus: ProcessingStatus
  extractedText: string | null
}

/** Response from GET /api/v1/documents/{id}/metadata */
export interface DocumentMetadata {
  documentId: number
  processingStatus: ProcessingStatus
  pageCount: number | null
  pdfTitle: string | null
  pdfAuthor: string | null
  pdfCreationDate: string | null
  processedAt: string | null
}

// ─── Analysis ────────────────────────────────────────────────────────────────
export interface KeyClause {
  title: string
  riskLevel: string
  explanation: string
  recommendation: string
}

export interface Analysis {
  id: number
  documentId: number
  documentType: string
  summary: string
  riskScore: number
  overallRisk: string
  keyClauses: KeyClause[]
  missingClauses: string[]
  recommendations: string[]
  importantDates: string[]
  parties: string[]
  analyzedAt: string
}

// ─── Chat ────────────────────────────────────────────────────────────────────
export type MessageRole = 'user' | 'ai'

export interface ChatMessage {
  id: number
  role: MessageRole
  text: string
  timestamp: Date
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface StatCard {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: string
  color: string
  iconColor: string
}

export interface ActivityItem {
  id: number
  action: string
  document: string
  user: string
  time: string
}

// ─── UI Primitives ────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  msg: string
  type: ToastType
}

export type Theme = 'light' | 'dark' | 'system'
