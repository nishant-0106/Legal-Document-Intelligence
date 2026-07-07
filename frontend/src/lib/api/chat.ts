import { api } from '../axios'
import type { ChatMessage } from '@/types'

export async function sendChatMessageApi(
  message: string,
  documentId?: number
): Promise<ChatMessage> {
  const response = await api.post<ChatMessage>('/chat', { message, documentId })
  return response.data
}

export async function getChatHistoryApi(documentId?: number): Promise<ChatMessage[]> {
  const response = await api.get<ChatMessage[]>(`/chat/history/${documentId}`)
  return response.data
}
