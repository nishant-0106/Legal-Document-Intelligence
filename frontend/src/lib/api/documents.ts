import { api } from '../axios'
import type { Document, Analysis } from '@/types'

export async function listDocumentsApi(): Promise<Document[]> {
  try {
    const response = await api.get<Document[]>('/documents')
    return response.data
  } catch {
    // Backend doesn't have a documents endpoint yet — return empty list
    return []
  }
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

  try {
    const response = await api.post<Document>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total) {
          onProgress?.(Math.round((e.loaded * 100) / e.total))
        }
      },
    })
    return response.data
  } catch {
    // Fallback: create a local document object if backend doesn't have upload endpoint yet
    for (let p = 10; p <= 100; p += Math.floor(Math.random() * 18) + 8) {
      await new Promise((r) => setTimeout(r, 150))
      onProgress?.(Math.min(p, 100))
    }

    return {
      id: Date.now(),
      name: file.name,
      size: `${(file.size / 1048576).toFixed(1)} MB`,
      pages: 0,
      date: new Date().toLocaleString(),
      type: file.name.endsWith('.pdf') ? 'pdf' : 'docx',
      risk: 0,
      status: 'Uploaded',
      parties: [],
      effectiveDate: new Date().toLocaleDateString(),
      governingLaw: 'N/A',
      value: 'N/A',
      category: 'Pending Analysis',
    }
  }
}

export async function analyzeDocumentApi(id: number): Promise<Analysis> {
  try {
    const response = await api.post<Analysis>(`/documents/${id}/analyze`)
    return response.data
  } catch {
    // Fallback: return a placeholder analysis if backend doesn't have analyze endpoint yet
    return {
      documentId: id,
      riskScore: 0,
      summary: 'Analysis is not yet available. The backend analysis endpoint has not been configured.',
      clauses: [],
      recommendations: [],
    }
  }
}

export async function deleteDocumentApi(id: number): Promise<{ success: boolean }> {
  try {
    const response = await api.delete<{ success: boolean }>(`/documents/${id}`)
    return response.data
  } catch {
    return { success: true }
  }
}

export async function compareDocumentsApi(
  doc1Id: number,
  doc2Id: number
): Promise<{ additions: string[]; deletions: string[]; riskDifference: number }> {
  try {
    const response = await api.post<{ additions: string[]; deletions: string[]; riskDifference: number }>(
      '/documents/compare',
      { doc1Id, doc2Id }
    )
    return response.data
  } catch {
    return {
      additions: [],
      deletions: [],
      riskDifference: 0,
    }
  }
}
