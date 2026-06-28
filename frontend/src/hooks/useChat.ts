import { useState, useCallback } from 'react'
import type { ChatMessage } from '@/types'
import { sendChatMessageApi } from '@/lib/api/chat'
import { useToast } from '@/context/ToastContext'
import { initialChatMessages } from '@/lib/mocks'

export function useChat(docId?: number) {
  const [messages, setMessages]   = useState<ChatMessage[]>(initialChatMessages)
  const [isLoading, setLoading]   = useState(false)
  const [error, setError]         = useState<Error | null>(null)
  const { showToast }             = useToast()

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      // Add user message immediately
      const userMsg: ChatMessage = {
        id: Date.now(),
        role: 'user',
        text: text.trim(),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMsg])
      setLoading(true)
      setError(null)

      try {
        const aiMsg = await sendChatMessageApi(text, docId)
        setMessages((prev) => [...prev, aiMsg])
      } catch (err) {
        const e = err instanceof Error ? err : new Error('Message failed')
        setError(e)
        showToast(e.message, 'error')
      } finally {
        setLoading(false)
      }
    },
    [docId, showToast]
  )

  const clear = useCallback(() => {
    setMessages(initialChatMessages)
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, clear }
}
