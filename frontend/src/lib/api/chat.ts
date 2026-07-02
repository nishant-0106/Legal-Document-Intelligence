import { api } from '../axios'
import type { ChatMessage } from '@/types'

export async function sendChatMessageApi(
  message: string,
  documentId?: number
): Promise<ChatMessage> {
  try {
    const response = await api.post<ChatMessage>('/chat', { message, documentId })
    return response.data
  } catch {
    // Fallback: backend chat endpoint not yet implemented
    return {
      id: Date.now(),
      role: 'ai',
      text: 'The AI chat backend is not yet connected. Please ensure the server is running and the chat endpoint is configured.',
      timestamp: new Date(),
    }
  }
}

export async function getChatHistoryApi(documentId?: number): Promise<ChatMessage[]> {
  try {
    const response = await api.get<ChatMessage[]>(`/chat/history/${documentId}`)
    return response.data
  } catch {
    return []
  }
}
