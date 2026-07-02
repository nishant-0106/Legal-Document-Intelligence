import { api } from '../axios'
import type { Document, Analysis } from '@/types'

// ─── Document API ────────────────────────────────────────────────────────────

export async function listDocumentsApi(): Promise<Document[]> {
  const response = await api.get<Document[]>('/documents')
  return response.data
}

export async function getDocumentApi(id: number): Promise<Document> {
  const response = await api.get<Document>(`/documents/${id}`)
  return response.data
}

export async function uploadDocumentApi(
  file: File,
  onProgress?: (progress: number) => void
): Promise<Document> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<{ message: string; document: Document }>(
    '/documents/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total) {
          onProgress?.(Math.round((e.loaded * 100) / e.total))
        }
      },
    }
  )

  return response.data.document
}

export async function deleteDocumentApi(id: number): Promise<{ success: boolean }> {
  const response = await api.delete<{ success: boolean; message: string }>(`/documents/${id}`)
  return response.data
}

/**
 * Build the download URL for viewing a PDF document in-browser.
 * Requires the JWT token for authentication.
 */
export function getDocumentDownloadUrl(id: number): string {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'
  return `${baseUrl}/documents/${id}/download`
}

// ─── Analysis API (future phase — stubs) ─────────────────────────────────────

export async function analyzeDocumentApi(id: number): Promise<Analysis> {
  const response = await api.post<Analysis>(`/documents/${id}/analyze`)
  return response.data
}

export async function compareDocumentsApi(
  doc1Id: number,
  doc2Id: number
): Promise<{ additions: string[]; deletions: string[]; riskDifference: number }> {
  const response = await api.post<{ additions: string[]; deletions: string[]; riskDifference: number }>(
    '/documents/compare',
    { doc1Id, doc2Id }
  )
  return response.data
}
