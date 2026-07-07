import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  User,
  Calendar,
  FileText,
  Shield,
  Loader2,
  Info,
  Clock,
  AlertTriangle,
  FileSearch,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAnalysis } from '@/hooks/useAnalysis'
import { useDocuments } from '@/hooks/useDocuments'

export function AnalysisPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { documents, isLoading: loadingDocs } = useDocuments()
  const { analysis, isLoading: analyzing, analyze, fetchAnalysis, reset } = useAnalysis()
  const [openClauses, setOpenClauses] = useState<Record<number, boolean>>({})
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null)

  // Resolve document ID from query params or default to first document
  useEffect(() => {
    if (documents.length > 0) {
      const qDocId = searchParams.get('docId')
      if (qDocId) {
        const parsed = parseInt(qDocId, 10)
        if (!isNaN(parsed) && documents.some((d) => d.id === parsed)) {
          setSelectedDocId(parsed)
          return
        }
      }
      // Default to first document if no valid qDocId
      if (selectedDocId === null) {
        setSelectedDocId(documents[0].id)
      }
    }
  }, [documents, searchParams, selectedDocId])

  // Fetch analysis when selected document changes
  useEffect(() => {
    if (selectedDocId) {
      fetchAnalysis(selectedDocId)
    } else {
      reset()
    }
  }, [selectedDocId, fetchAnalysis, reset])

  const handleAnalyze = async () => {
    if (selectedDocId) {
      try {
        await analyze(selectedDocId)
      } catch {
        // Handled in hook
      }
    }
  }

  // Get active document object
  const activeDoc = documents.find((d) => d.id === selectedDocId)

  const getRiskBadgeVariant = (risk: string) => {
    const r = risk.toLowerCase()
    if (r === 'high') return 'red'
    if (r === 'medium') return 'amber'
    return 'green'
  }

  const getRiskProgressColor = (score: number) => {
    if (score > 70) return '#EF4444' // red
    if (score > 40) return '#F59E0B' // amber
    return '#10B981' // emerald
  }

  // ─── Loading state for initial render ───────────────────────────────────────
  if (loadingDocs && documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-semibold">Loading documents...</p>
      </div>
    )
  }

  // ─── No documents in workspace ──────────────────────────────────────────────
  if (documents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Document Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Get instant legal insights, risk assessment, and clause breakdowns.
          </p>
        </div>
        <Card className="text-center py-16">
          <FileText size={56} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="font-bold text-lg text-gray-700 dark:text-gray-300 mb-1">No documents uploaded yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            You need to upload at least one PDF contract before running AI legal analysis.
          </p>
          <Button variant="primary" className="mt-6" onClick={() => navigate('/upload')}>
            Go to Upload
          </Button>
        </Card>
      </div>
    )
  }

  if (!activeDoc) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Legal Audit</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review AI risk score, key commitments, and missing clauses.
          </p>
        </div>

        {/* Document Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider hidden sm:inline">Contract:</span>
          <select
            value={selectedDocId || ''}
            onChange={(e) => setSelectedDocId(Number(e.target.value))}
            className="w-full md:w-80 px-3.5 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
            disabled={analyzing}
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.originalFileName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* State Renderers: Processing, Failed, No Analysis, or Analyzed */}
      {analyzing ? (
        <Card className="py-20 text-center flex flex-col items-center justify-center">
          <Loader2 size={48} className="text-brand-600 animate-spin mb-4" />
          <h3 className="text-lg font-bold">LexIntel AI is auditing contract…</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mt-1 leading-relaxed">
            Extracting clauses, rating liability risk, and running completeness checks. This takes about 10-15 seconds.
          </p>
        </Card>
      ) : activeDoc && (activeDoc.processingStatus === 'PROCESSING' || activeDoc.processingStatus === 'UPLOADED') ? (
        <Card className="py-16 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800">
          <Clock size={44} className="text-amber-500 animate-pulse mb-3" />
          <h3 className="text-lg font-bold">Text Extraction in Progress</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mt-1 leading-relaxed">
            PDF text extraction is still running for this contract. Please reload/wait a moment.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setSelectedDocId(selectedDocId)}>
            Refresh State
          </Button>
        </Card>
      ) : activeDoc && activeDoc.processingStatus === 'FAILED' ? (
        <Card className="py-16 text-center flex flex-col items-center justify-center border-2 border-dashed border-red-200 dark:border-red-900/30">
          <AlertCircle size={44} className="text-red-500 mb-3" />
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400">PDF Extraction Failed</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mt-1 leading-relaxed">
            We couldn't extract text from this PDF file. It might be password-protected, encrypted, or corrupted.
          </p>
        </Card>
      ) : !analysis ? (
        <Card className="py-16 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800">
          <FileSearch size={48} className="text-brand-500/80 mb-4" />
          <h3 className="text-xl font-bold">Awaiting AI Audit</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mt-1.5 leading-relaxed">
            This document has not been audited yet. Run a full analysis to extract key clauses, identify risks, and review missing provisions.
          </p>
          <Button
            variant="primary"
            onClick={handleAnalyze}
            className="mt-6 gap-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 border-none px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20"
          >
            <Sparkles size={16} /> Run Legal Analysis
          </Button>
        </Card>
      ) : (
        /* Real Analysis Dashboard */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Info, Summary, Clauses */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Document / Analysis Overview Card */}
            <Card>
              <div className="mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <Badge variant="blue" className="mb-2">{analysis.documentType || 'Legal Document'}</Badge>
                  <h3 className="font-bold text-xl tracking-tight leading-tight">{activeDoc.originalFileName}</h3>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex gap-2">
                    <span>Uploaded {new Date(activeDoc.uploadedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Analyzed {new Date(analysis.analyzedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Badge variant={getRiskBadgeVariant(analysis.overallRisk) as any} className="self-start text-sm py-1 px-3">
                  {analysis.overallRisk} Risk
                </Badge>
              </div>

              {/* Key Parties list */}
              {analysis.parties && analysis.parties.length > 0 && (
                <div className="space-y-2 mt-4 text-sm">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Contracting Parties:</span>
                  <div className="flex flex-wrap gap-2">
                    {analysis.parties.map((party, idx) => (
                      <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 text-xs font-medium">
                        <User size={12} className="text-gray-400" />
                        {party}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Executive Summary */}
            <Card>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Info size={18} className="text-brand-500" />
                Executive Summary
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {analysis.summary}
              </p>
            </Card>

            {/* Key Clauses (Accordion list) */}
            <Card>
              <div className="mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Shield size={18} className="text-indigo-500" />
                  Key Extracted Clauses
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Accordion breakdowns of clauses and legal advice.</p>
              </div>

              <div className="space-y-3">
                {analysis.keyClauses.map((clause, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() =>
                        setOpenClauses((prev) => ({ ...prev, [idx]: !prev[idx] }))
                      }
                      className="w-full flex items-center gap-3 p-4 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors text-left"
                    >
                      <span className="font-bold text-sm flex-1 text-gray-800 dark:text-gray-200">{clause.title}</span>
                      <Badge variant={getRiskBadgeVariant(clause.riskLevel) as any}>
                        {clause.riskLevel}
                      </Badge>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 ${openClauses[idx] ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openClauses[idx] && (
                      <div className="px-4 py-4 bg-white dark:bg-gray-800/10 border-t border-gray-200 dark:border-gray-700 space-y-3 text-sm">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Clause Breakdown:</span>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{clause.explanation}</p>
                        </div>
                        {clause.recommendation && (
                          <div className="p-3 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 rounded-lg">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">AI Recommendation:</span>
                            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed font-medium">{clause.recommendation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right panel: Risk Score, Recommendations, Dates, Missing Clauses */}
          <div className="space-y-6">
            
            {/* Risk Score Circle Gauge */}
            <Card className="flex flex-col items-center">
              <h3 className="font-bold text-base text-gray-500 uppercase tracking-wider mb-4">Overall Risk Score</h3>
              <div className="relative w-28 h-28 mb-4">
                <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="8" className="dark:stroke-gray-700" />
                  {/* Progress Circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke={getRiskProgressColor(analysis.riskScore)}
                    strokeWidth="9"
                    strokeDasharray={`${((analysis.riskScore / 100) * 314).toFixed(1)} 314`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black">{analysis.riskScore}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase">/ 100 max</span>
                </div>
              </div>
              <Badge variant={getRiskBadgeVariant(analysis.overallRisk) as any} className="mb-2">
                {analysis.overallRisk} Risk Level
              </Badge>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 max-w-xs mt-1">
                Risk is graded based on liability constraints, indemnification provisions, and compliance gaps.
              </p>
            </Card>

            {/* AI Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <Card>
                <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Actionable Advice
                </h3>
                <ul className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400 leading-normal">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Missing Clauses */}
            {analysis.missingClauses && analysis.missingClauses.length > 0 && (
              <Card className="border border-red-100 dark:border-red-950 bg-red-50/10 dark:bg-red-950/5">
                <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle size={16} className="text-red-500" />
                  Potential Gaps
                </h3>
                <ul className="space-y-2 text-xs text-red-800 dark:text-red-300 leading-normal">
                  {analysis.missingClauses.map((clause, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="flex-shrink-0 text-red-400 font-bold">•</span>
                      <span>{clause}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Important Dates */}
            {analysis.importantDates && analysis.importantDates.length > 0 && (
              <Card>
                <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500" />
                  Key Dates & Deadlines
                </h3>
                <div className="space-y-2.5">
                  {analysis.importantDates.map((dateItem, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs">
                      <div className="w-5 h-5 rounded-lg bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center flex-shrink-0 text-blue-500 mt-0.5">
                        <Clock size={11} />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        {dateItem}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
