import { useState, useEffect, useCallback } from 'react'
import type { Document } from '@/types'
import {
  listDocumentsApi,
  getDocumentApi,
  uploadDocumentApi,
  deleteDocumentApi,
} from '@/lib/api/documents'
import { useToast } from '@/context/ToastContext'

export interface UseDocumentsState {
  documents:  Document[]
  isLoading:  boolean
  error:      Error | null
  current:    Document | null
}

export function useDocuments() {
  const [state, setState] = useState<UseDocumentsState>({
    documents: [],
    isLoading: false,
    error: null,
    current: null,
  })
  const { showToast } = useToast()

  // Fetch all documents
  const fetchAll = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const docs = await listDocumentsApi()
      setState((s) => ({ ...s, documents: docs, isLoading: false }))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch documents')
      setState((s) => ({ ...s, error, isLoading: false }))
      showToast(error.message, 'error')
    }
  }, [showToast])

  // Fetch single document
  const fetch = useCallback(async (id: number) => {
    setState((s) => ({ ...s, isLoading: true }))
    try {
      const doc = await getDocumentApi(id)
      setState((s) => ({ ...s, current: doc, isLoading: false }))
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch document')
      setState((s) => ({ ...s, error, isLoading: false }))
      showToast(error.message, 'error')
    }
  }, [showToast])

  // Upload document
  const upload = useCallback(
    async (file: File, onProgress?: (p: number) => void) => {
      setState((s) => ({ ...s, isLoading: true }))
      try {
        const doc = await uploadDocumentApi(file, onProgress)
        setState((s) => ({
          ...s,
          documents: [doc, ...s.documents],
          isLoading: false,
        }))
        showToast('Document uploaded successfully', 'success')
        return doc
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed')
        setState((s) => ({ ...s, error, isLoading: false }))
        showToast(error.message, 'error')
        throw error
      }
    },
    [showToast]
  )

  // Delete document
  const remove = useCallback(
    async (id: number) => {
      try {
        await deleteDocumentApi(id)
        setState((s) => ({
          ...s,
          documents: s.documents.filter((d) => d.id !== id),
        }))
        showToast('Document deleted', 'success')
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Delete failed')
        showToast(error.message, 'error')
      }
    },
    [showToast]
  )

  // Load all on mount
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    ...state,
    fetchAll,
    fetch,
    upload,
    remove,
  }
}
