import { useState, useCallback } from 'react'
import type { Analysis } from '@/types'
import { analyzeDocumentApi, getAnalysisApi } from '@/lib/api/documents'
import { useToast } from '@/context/ToastContext'

export function useAnalysis() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<Error | null>(null)
  const { showToast }           = useToast()

  const analyze = useCallback(
    async (docId: number) => {
      setLoading(true)
      setError(null)
      try {
        const result = await analyzeDocumentApi(docId)
        setAnalysis(result)
        showToast('Analysis complete', 'success')
        return result
      } catch (err) {
        const msg = (err as any)?.response?.data?.message || (err instanceof Error ? err.message : 'Analysis failed')
        const e = new Error(msg)
        setError(e)
        showToast(e.message, 'error')
        throw e
      } finally {
        setLoading(false)
      }
    },
    [showToast]
  )

  const fetchAnalysis = useCallback(
    async (docId: number) => {
      setLoading(true)
      setError(null)
      try {
        const result = await getAnalysisApi(docId)
        setAnalysis(result)
        return result
      } catch (err) {
        const e = err instanceof Error ? err : new Error('Failed to fetch analysis')
        setError(e)
        setAnalysis(null)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setAnalysis(null)
    setError(null)
  }, [])

  return { analysis, isLoading, error, analyze, fetchAnalysis, reset }
}
