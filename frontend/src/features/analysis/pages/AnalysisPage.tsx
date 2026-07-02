import { useState } from 'react'
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAnalysis } from '@/hooks/useAnalysis'
import { useDocuments } from '@/hooks/useDocuments'


export function AnalysisPage() {
  const { documents } = useDocuments()
  const { analysis, isLoading, analyze } = useAnalysis()
  const [openClauses, setOpenClauses] = useState<Record<number, boolean>>({})
  const [selectedDocId, setSelectedDocId] = useState(documents[0]?.id || 1)

  const handleAnalyze = async () => {
    await analyze(selectedDocId)
  }

  if (!analysis) {
    return (
      <div className="space-y-6">
        <Card>
          <h3 className="text-sm font-bold mb-4">Select a Document</h3>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(Number(e.target.value))}
            className="form-input mb-4"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.originalFileName}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            isLoading={isLoading}
            onClick={handleAnalyze}
            fullWidth
          >
            Analyze Document
          </Button>
        </Card>
      </div>
    )
  }

  const getRiskColor = (risk: string) => {
    if (risk === 'high') return 'text-red-600'
    if (risk === 'medium') return 'text-amber-600'
    return 'text-emerald-600'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Document info */}
        <Card>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="font-bold text-lg">Service Agreement Q4.pdf</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">24 pages • Dec 1, 2024</div>
            </div>
            <Badge variant="red">High Risk</Badge>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ['Parties', 'TechCorp Inc. ↔ Vendor Solutions LLC'],
              ['Effective', 'Jan 1, 2025'],
              ['Value', '$480,000'],
              ['Law', 'Delaware, USA'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Summary */}
        <Card>
          <h3 className="font-bold mb-3">Summary</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {analysis.summary}
          </p>
        </Card>

        {/* Clauses */}
        <Card>
          <h3 className="font-bold mb-4">Extracted Clauses</h3>
          <div className="space-y-2">
            {analysis.clauses.map((clause) => (
              <div key={clause.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setOpenClauses((prev) => ({ ...prev, [clause.id]: !prev[clause.id] }))
                  }
                  className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="font-semibold text-sm flex-1 text-left">{clause.title}</span>
                  <Badge variant={clause.risk === 'high' ? 'red' : clause.risk === 'medium' ? 'amber' : 'green'}>
                    {clause.risk}
                  </Badge>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${openClauses[clause.id] ? 'rotate-180' : ''}`}
                  />
                </button>
                {openClauses[clause.id] && (
                  <div className="px-3 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                    {clause.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right panel */}
      <div className="space-y-6">
        {/* Risk score */}
        <Card>
          <h3 className="text-sm font-bold text-center mb-4">Overall Risk Score</h3>
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-4">
              <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="10"
                  strokeDasharray={`${((analysis.riskScore / 100) * 314).toFixed(1)} 314`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{analysis.riskScore}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">RISK</span>
              </div>
            </div>
            <p className="text-xs text-center text-gray-600 dark:text-gray-400">
              {analysis.riskScore > 70 ? 'High Risk' : analysis.riskScore > 40 ? 'Medium Risk' : 'Low Risk'}
            </p>
          </div>
        </Card>

        {/* Recommendations */}
        <Card>
          <h3 className="font-bold mb-4">Recommendations</h3>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  {rec.type === 'high' ? (
                    <AlertCircle size={16} className="text-red-600" />
                  ) : (
                    <CheckCircle size={16} className="text-emerald-600" />
                  )}
                </div>
                <div>
                  <div className={`text-sm font-semibold ${getRiskColor(rec.type)}`}>{rec.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.text}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
