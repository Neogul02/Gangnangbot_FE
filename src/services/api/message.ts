import { api, streamSSE } from '../api'
import type { GetMessagesResponse, SendMessageRequest, StreamMessage } from './types'

// ==================== 메시지 API ====================

/**
 * 특정 세션의 메시지 내역 조회
 * 시간순으로 정렬된 메시지 목록 반환
 * @param sessionId - 세션 UUID
 * @param limit - 조회할 메시지 개수 제한 (선택사항)
 * @requires Authorization: Bearer {access_token}
 */
export async function getSessionMessages(sessionId: string, limit?: number): Promise<GetMessagesResponse> {
  const response = await api.get<GetMessagesResponse>(`/sessions/${sessionId}/messages`, {
    params: limit ? { limit } : undefined,
  })
  return response.data
}

/**
 * 메시지 전송 및 스트리밍 응답 수신
 * SSE(Server-Sent Events)를 통해 실시간으로 AI 응답을 받음
 * @param request - 세션 ID와 메시지 내용
 * @param onMessage - 스트리밍 메시지를 받을 때마다 호출되는 콜백
 * @param onError - 에러 발생 시 호출되는 콜백
 * @requires Authorization: Bearer {access_token}
 *
 * @example
 * await sendMessage(
 *   { session_id: 'abc-123', message: '안녕하세요' },
 *   (chunk) => {
 *     if (!chunk.done) {
 *       console.log('응답:', chunk.text)
 *     } else {
 *       console.log('완료!')
 *     }
 *   }
 * )
 */
export async function sendMessage(request: SendMessageRequest, onMessage: (message: StreamMessage) => void, onError?: (error: Error) => void): Promise<void> {
  return streamSSE('/chat/message', request, onMessage, onError)
}
