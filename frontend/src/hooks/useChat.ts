import { useState, useCallback, useEffect } from 'react'
import type { ChatMessage } from '@/types'
import { sendChatMessageApi, getChatHistoryApi } from '@/lib/api/chat'
import { useToast } from '@/context/ToastContext'

const welcomeMessage: ChatMessage = {
  id: 1,
  role: 'ai',
  text: "Hello! I'm LexIntel AI. I can analyze clauses, explain terms, identify risks, and answer contract questions.\n\nSelect a document from the dropdown to start chatting. What would you like to know?",
  timestamp: new Date(),
}

export function useChat(docId?: number) {
  const [messages, setMessages]   = useState<ChatMessage[]>([welcomeMessage])
  const [isLoading, setLoading]   = useState(false)
  const [error, setError]         = useState<Error | null>(null)
  const { showToast }             = useToast()

  // Load chat history when active document changes
  useEffect(() => {
    if (!docId) {
      setMessages([welcomeMessage])
      return
    }

    const loadHistory = async () => {
      setLoading(true)
      setError(null)
      try {
        const history = await getChatHistoryApi(docId)
        // Convert timestamp strings from API into Date objects
        const formattedHistory = history.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))

        if (formattedHistory.length > 0) {
          setMessages(formattedHistory)
        } else {
          setMessages([welcomeMessage])
        }
      } catch (err) {
        const e = err instanceof Error ? err : new Error('Failed to load chat history')
        setError(e)
        showToast(e.message, 'error')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [docId, showToast])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return
      if (!docId) {
        showToast('Please select a document first', 'error')
        return
      }

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
        // Ensure timestamp is a Date object
        const formattedAiMsg = {
          ...aiMsg,
          timestamp: new Date(aiMsg.timestamp),
        }
        setMessages((prev) => [...prev, formattedAiMsg])
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
    setMessages([welcomeMessage])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, clear }
}
