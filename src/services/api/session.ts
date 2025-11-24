import { api } from '../api'
import type { CreateSessionResponse, ListSessionsResponse, DeleteSessionResponse } from './types'

// ==================== 세션 API ====================

/**
 * 새로운 채팅 세션 생성
 * 첫 메시지를 보내면 해당 메시지가 세션 제목으로 자동 설정됨
 * @requires Authorization: Bearer {access_token}
 */
export async function createSession(): Promise<CreateSessionResponse> {
  const response = await api.post<CreateSessionResponse>('/sessions/')
  return response.data
}

/**
 * 세션 목록 조회
 * 현재 로그인된 사용자의 모든 세션을 최신순으로 반환
 * @param includeInactive - 비활성 세션 포함 여부 (기본값: false)
 * @requires Authorization: Bearer {access_token}
 */
export async function listSessions(includeInactive = false): Promise<ListSessionsResponse> {
  const response = await api.get<ListSessionsResponse>('/sessions/', {
    params: { include_inactive: includeInactive },
  })
  return response.data
}

/**
 * 세션 삭제 (비활성화)
 * 실제로 데이터를 삭제하지 않고 is_active를 false로 변경 (소프트 삭제)
 * @param sessionId - 세션 UUID
 * @requires Authorization: Bearer {access_token}
 */
export async function deleteSession(sessionId: string): Promise<DeleteSessionResponse> {
  const response = await api.delete<DeleteSessionResponse>(`/sessions/${sessionId}`)
  return response.data
}
