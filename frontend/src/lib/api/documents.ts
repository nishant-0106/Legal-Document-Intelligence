import type { Document, Analysis } from '@/types'
import { mockDocuments, mockClauses } from '@/lib/mocks'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function listDocumentsApi(): Promise<Document[]> {
  // Real: return (await api.get<Document[]>('/documents')).data
  await delay(600)
  return mockDocuments
}

export async function getDocumentApi(id: number): Promise<Document> {
  // Real: return (await api.get<Document>(`/documents/${id}`)).data
  await delay(400)
  return mockDocuments.find((d) => d.id === id) || mockDocuments[0]
}

export async function uploadDocumentApi(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Document> {
  // Real implementation:
  // const formData = new FormData()
  // formData.append('file', file)
  // return (await api.post<Document>('/documents/upload', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  //   onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  // })).data

  // Mock: simulate progress
  for (let p = 10; p <= 100; p += Math.floor(Math.random() * 18) + 8) {
    await delay(150)
    onProgress?.(Math.min(p, 100))
  }

  return {
    id: Date.now(),
    name: file.name,
    size: `${(file.size / 1048576).toFixed(1)} MB`,
    pages: 24,
    date: 'Just now',
    type: file.name.endsWith('.pdf') ? 'pdf' : 'docx',
    risk: Math.floor(Math.random() * 70) + 20,
    status: 'Uploaded',
    parties: ['Your Company', 'Counterparty'],
    effectiveDate: new Date().toLocaleDateString(),
    governingLaw: 'Delaware, USA',
    value: '$0',
    category: 'General Agreement',
  }
}

export async function analyzeDocumentApi(id: number): Promise<Analysis> {
  // Real: return (await api.post<Analysis>(`/documents/${id}/analyze`)).data
  await delay(1200)
  return {
    documentId: id,
    riskScore: 72,
    summary:
      'This service agreement establishes terms for software development services over 12 months. Standard deliverables, payment schedules, and IP provisions present. Several clauses carry elevated risk due to broad liability exclusions and aggressive auto-renewal.',
    clauses: mockClauses,
    recommendations: [
      {
        type: 'high',
        title: 'Negotiate termination clause',
        text: 'Immediate termination gives counterparty excessive power. Request mutual 30-day notice.',
      },
      {
        type: 'medium',
        title: 'Cap liability exposure',
        text: 'Liability uncapped for IP claims. Negotiate a cap equal to 12 months fees.',
      },
      {
        type: 'low',
        title: 'Confidentiality is adequate',
        text: 'The 5-year confidentiality term is standard for this agreement type.',
      },
    ],
  }
}

export async function deleteDocumentApi(_id: number): Promise<{ success: boolean }> {
  // Real: return (await api.delete(`/documents/${id}`)).data
  await delay(400)
  return { success: true }
}

export async function compareDocumentsApi(
  _doc1Id: number,
  _doc2Id: number
): Promise<{ additions: string[]; deletions: string[]; riskDifference: number }> {
  // Real: return (await api.post('/documents/compare', { doc1Id, doc2Id })).data
  await delay(1000)
  return {
    additions: [
      'New liquidated damages clause (Section 8.2)',
      'Auto-renewal provision added (Section 8.4)',
      'Broadened confidentiality scope (Section 6)',
    ],
    deletions: [
      '90-day termination notice (now 30 days)',
      'Mutual liability cap (now one-sided)',
    ],
    riskDifference: 34,
  }
}
