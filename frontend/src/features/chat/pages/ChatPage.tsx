import { useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useChat } from '@/hooks/useChat'
import { useDocuments } from '@/hooks/useDocuments'

const suggestedQuestions = [
  'What are the key risks in this contract?',
  'Are there any termination clauses?',
  'What are the payment terms?',
  'Is there an auto-renewal clause?',
]

export function ChatPage() {
  const { messages, isLoading, sendMessage } = useChat()
  const { documents } = useDocuments()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async () => {
    const text = inputRef.current?.value.trim()
    if (!text) return
    await sendMessage(text)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSuggestedQuestion = (q: string) => {
    if (inputRef.current) {
      inputRef.current.value = q
      inputRef.current.focus()
    }
  }

  const activeDoc = documents.length > 0 ? documents[0] : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-160px)]">
      {/* Sidebar */}
      <div className="hidden lg:block lg:col-span-1 space-y-4">
        <Card>
          <h3 className="text-sm font-bold mb-3">Active Document</h3>
          {activeDoc ? (
            <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span>📄</span>
              <div>
                <div className="text-xs font-semibold">{activeDoc.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{activeDoc.pages} pages</div>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
              No document loaded. Upload one to get started.
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-bold mb-3">Suggested Questions</h3>
          <div className="space-y-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedQuestion(q)}
                className="w-full text-left text-xs p-2 rounded bg-gray-100 dark:bg-gray-700 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors border border-gray-200 dark:border-gray-600 hover:border-brand-400"
              >
                {q}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-xs font-bold">LexIntel AI</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Powered by GPT-4o. Not a substitute for licensed legal counsel.
          </p>
        </Card>
      </div>

      {/* Main chat */}
      <div className="lg:col-span-3 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`bubble-${msg.role} max-w-sm px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 flex gap-1">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                placeholder="Ask anything about your contract…"
                className="form-input resize-none max-h-24"
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
                isLoading={isLoading}
                className="mb-1"
              >
                <Send size={14} />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
