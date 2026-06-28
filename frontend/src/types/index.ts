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
export type RiskLevel = 'low' | 'medium' | 'high'
export type FileType  = 'pdf' | 'docx' | 'doc' | 'txt'

export interface Document {
  id: number
  name: string
  size: string
  pages: number
  date: string
  type: FileType
  risk: number               // 0–100
  status: string
  parties: string[]
  effectiveDate: string
  governingLaw: string
  value: string
  category: string
}

// ─── Analysis ────────────────────────────────────────────────────────────────
export interface Clause {
  id: number
  title: string
  risk: RiskLevel
  section: string
  text: string
}

export interface Recommendation {
  type: RiskLevel
  title: string
  text: string
}

export interface Analysis {
  documentId: number
  riskScore: number
  summary: string
  clauses: Clause[]
  recommendations: Recommendation[]
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
