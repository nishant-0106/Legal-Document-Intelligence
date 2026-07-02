import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useDocuments } from '@/hooks/useDocuments'

export function ComparePage() {
  const { documents } = useDocuments()
  const [selected, setSelected] = useState<[number | null, number | null]>([null, null])
  const [showDiff, setShowDiff] = useState(false)

  const doc1 = documents.find((d) => d.id === selected[0])
  const doc2 = documents.find((d) => d.id === selected[1])
  const canCompare = doc1 && doc2

  const differences = [
    { type: 'del', text: 'Termination: 90 days notice required' },
    { type: 'add', text: 'Termination: 30 days notice required' },
    { type: 'del', text: 'Liability cap: $50,000' },
    { type: 'add', text: 'Liability cap: $10,000' },
    { type: 'add', text: 'Auto-renewal clause added' },
  ]

  return (
    <div className="space-y-6">
      {/* Document selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {([0, 1] as const).map((idx) => (
          <div key={idx}>
            <Card>
              {selected[idx] ? (
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl">📄</span>
                    <div className="flex-1">
                      <div className="font-semibold">{documents.find((d) => d.id === selected[idx])?.originalFileName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {documents.find((d) => d.id === selected[idx])?.status}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => setSelected(([s0, s1]) => (idx === 0 ? [null, s1] : [s0, null]))}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <div className="font-bold">Upload Document {idx + 1}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Click to select from library</div>
                  </div>
                  <select
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      if (val) setSelected(([s0, s1]) => (idx === 0 ? [val, s1] : [s0, val]))
                    }}
                    className="form-input"
                  >
                    <option value="">Select a document...</option>
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.originalFileName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>

      {/* Comparison */}
      {canCompare && (
        <>
          <div className="flex justify-center">
            <Button variant="primary" onClick={() => setShowDiff(true)}>
              Compare Documents
            </Button>
          </div>

          {showDiff && (
            <div className="space-y-6">
              {/* Risk comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[doc1, doc2].map((doc) => (
                  <Card key={doc!.id}>
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-4">
                        <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                          <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="#9CA3AF"
                            strokeWidth="10"
                            strokeDasharray="0 314"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-bold text-lg">—</span>
                        </div>
                      </div>
                      <div className="font-semibold">{doc!.originalFileName}</div>
                      <Badge
                        variant={doc!.status === 'ANALYZED' ? 'green' : 'blue'}
                        className="mt-2"
                      >
                        {doc!.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Clause differences */}
              <Card>
                <h3 className="font-bold mb-4">Clause Changes</h3>
                <div className="space-y-2">
                  {differences.map((diff, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-lg font-bold">
                        {diff.type === 'del' ? (
                          <span className="text-red-600">−</span>
                        ) : (
                          <span className="text-emerald-600">+</span>
                        )}
                      </span>
                      <span
                        className={`text-sm ${
                          diff.type === 'del'
                            ? 'line-through text-red-700 dark:text-red-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {diff.text}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
