// import { api } from '../axios'
import type { ChatMessage } from '@/types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const mockResponses = [
  (q: string) =>
    `Based on the contract, I analyzed your question about "${q.substring(0, 40)}..."\n\nFound relevant provisions in Section 4 (Payment) and Section 8 (Termination). The key risk is asymmetric termination rights without equivalent protections.\n\n**Recommendation:** Consult a licensed attorney before signing.`,
  () =>
    `The contract contains **3 penalty clauses**:\n\n1. **Late Payment** — 1.5% monthly interest (Section 4.3)\n2. **Early Termination** — 25% of remaining value (Section 8.2)\n3. **Non-compete Breach** — Injunctive relief + damages (Section 11.1)\n\nThe 24-month non-compete covering North America may be unenforceable in some jurisdictions.`,
  () =>
    `Yes, **Section 6 has a robust confidentiality clause**:\n\n- **Duration:** 5 years post-termination\n- **Scope:** All proprietary information\n- **Carve-outs:** Public information, prior knowledge, regulatory disclosure\n\nFairly standard with no major concerns. Ensure your team understands the scope.`,
]

let responseIndex = 0

export async function sendChatMessageApi(
  message: string,
  _documentId?: number
): Promise<ChatMessage> {
  // Real: return (await api.post('/chat', { message, documentId })).data
  await delay(1800)
  const text = mockResponses[responseIndex % mockResponses.length](message)
  responseIndex++
  return {
    id: Date.now(),
    role: 'ai',
    text,
    timestamp: new Date(),
  }
}

export async function getChatHistoryApi(_documentId?: number): Promise<ChatMessage[]> {
  // Real: return (await api.get(`/chat/history/${documentId}`)).data
  await delay(300)
  return []
}
