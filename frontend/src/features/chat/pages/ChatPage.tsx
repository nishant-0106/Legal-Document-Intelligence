import { useRef, useEffect, useState } from 'react'
import { Send, MessageSquare, AlertCircle, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useChat } from '@/hooks/useChat'
import { useDocuments } from '@/hooks/useDocuments'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'

const suggestedQuestions = [
  'What are the key risks in this contract?',
  'Are there any termination clauses?',
  'What are the payment terms?',
  'Is there an auto-renewal clause?',
]

export function ChatPage() {
  const { documents } = useDocuments()
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(undefined)

  // Auto-select first processed document when documents load
  useEffect(() => {
    if (documents.length > 0 && selectedDocId === undefined) {
      const firstProcessed = documents.find(d => d.processingStatus === 'PROCESSED')
      if (firstProcessed) {
        setSelectedDocId(firstProcessed.id)
      } else {
        setSelectedDocId(documents[0].id)
      }
    }
  }, [documents, selectedDocId])

  const { messages, isLoading, sendMessage } = useChat(selectedDocId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const activeDoc = documents.find(d => d.id === selectedDocId) || null
  const isProcessed = activeDoc?.processingStatus === 'PROCESSED'

  const handleSend = async () => {
    const text = inputRef.current?.value.trim()
    if (!text || !selectedDocId || !isProcessed) return
    
    // Clear input first
    if (inputRef.current) inputRef.current.value = ''
    
    await sendMessage(text)
  }

  const handleSuggestedQuestion = (q: string) => {
    if (inputRef.current && isProcessed) {
      inputRef.current.value = q
      inputRef.current.focus()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <div className="hidden lg:block lg:col-span-1 space-y-4">
        <Card className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Select Document</h3>
          <div className="space-y-2">
            <select
              value={selectedDocId || ''}
              onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full text-xs p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            >
              <option value="">-- Choose a Contract --</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.originalFileName}
                </option>
              ))}
            </select>

            {activeDoc && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-150 dark:border-gray-800">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                  {activeDoc.originalFileName}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    isProcessed 
                      ? 'bg-emerald-500' 
                      : activeDoc.processingStatus === 'FAILED' 
                      ? 'bg-red-500' 
                      : 'bg-amber-500 animate-pulse'
                  }`} />
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    {activeDoc.processingStatus || activeDoc.status}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Suggested Questions</h3>
          <div className="space-y-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                disabled={!isProcessed}
                onClick={() => handleSuggestedQuestion(q)}
                className={`w-full text-left text-xs p-2.5 rounded-lg border transition-all ${
                  isProcessed
                    ? 'bg-gray-50 dark:bg-gray-805 hover:bg-brand-50 dark:hover:bg-brand-900/10 hover:border-brand-400 dark:hover:border-brand-800 border-gray-150 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                    : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={16} className="text-brand-500" />
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Legal RAG Chat</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-450 leading-relaxed">
            This module uses Retrieval-Augmented Generation (RAG). Only matching snippets of the document are sent to the Gemini AI to ensure safety and context relevance.
          </p>
        </Card>
      </div>

      {/* Main chat */}
      <div className="lg:col-span-3 flex flex-col h-full">
        <Card className="flex-1 flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {activeDoc ? `Chatting with: ${activeDoc.originalFileName}` : 'AI Legal Chat'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activeDoc ? 'Ask context-specific questions about your legal agreement' : 'Select a document to begin'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-200/50 dark:border-gray-700/50 shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                  ) : (
                    <MarkdownRenderer content={msg.text} />
                  )}
                  <span className={`block text-[9px] mt-1.5 ${
                    msg.role === 'user' ? 'text-brand-200 text-right' : 'text-gray-450 text-left'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 border border-gray-205 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3.5 flex gap-1.5 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer warning if document is not processed */}
          {activeDoc && !isProcessed && (
            <div className="mx-4 mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-900/60 flex items-start gap-2 text-xs">
              {activeDoc.processingStatus === 'FAILED' ? (
                <>
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Text Extraction Failed.</span> We were unable to read this document's text. You cannot chat with this document. Please upload a different file.
                  </div>
                </>
              ) : (
                <>
                  <Loader2 size={16} className="shrink-0 mt-0.5 animate-spin" />
                  <div>
                    <span className="font-bold">Document is Processing.</span> We are extracting text and generating vector embeddings. AI Chat will be enabled as soon as this completes.
                  </div>
                </>
              )}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-205 dark:border-gray-850">
            <div className="flex gap-2.5 items-end">
              <textarea
                ref={inputRef}
                disabled={!selectedDocId || !isProcessed || isLoading}
                placeholder={
                  !selectedDocId 
                    ? "Select a document in the sidebar to start..."
                    : !isProcessed
                    ? "Waiting for processing to complete..."
                    : "Ask a question about this contract (e.g. governing law, liabilities)..."
                }
                className="form-input resize-none max-h-28 pr-12 rounded-xl py-3 text-sm focus:ring-brand-500 focus:border-brand-500 bg-gray-50 dark:bg-gray-805 disabled:bg-gray-100 dark:disabled:bg-gray-850 disabled:cursor-not-allowed border-gray-200 dark:border-gray-700"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSend}
                disabled={!selectedDocId || !isProcessed || isLoading}
                className="mb-1 rounded-xl p-3 h-10 w-10 flex items-center justify-center shrink-0"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
