import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

// API 함수 import
import * as authAPI from '../api/auth'
import * as sessionAPI from '../api/session'
import * as messageAPI from '../api/message'
import * as profileAPI from '../api/profile'

// 타입 import
import type { User, TokenResponse, CreateSessionResponse, ListSessionsResponse, DeleteSessionResponse, GetMessagesResponse, SendMessageRequest, StreamMessage, ProfileRequest, Profile } from '../api/types'

// ==================== Query Keys ====================
// TanStack Query의 캐시 키 정의
export const queryKeys = {
  // 인증 관련
  auth: {
    me: ['auth', 'me'] as const,
  },
  // 세션 관련
  sessions: {
    all: ['sessions'] as const,
    list: (includeInactive?: boolean) => ['sessions', 'list', { includeInactive }] as const,
    messages: (sessionId: string, limit?: number) => ['sessions', sessionId, 'messages', { limit }] as const,
  },
} as const

// ==================== Auth Hooks ====================

/**
 * 현재 로그인된 사용자 정보 조회
 * @example
 * const { data: user, isLoading } = useGetMe()
 */
export function useGetMe(options?: Omit<UseQueryOptions<User, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authAPI.getMe,
    ...options,
  })
}

/*
 * 테스트 토큰 생성 (개발용)
 * @example
 * const { mutate: generateToken } = useGenerateTestToken({
 *   onSuccess: (data) => {
 *     console.log('Token:', data.access_token)
 *   }
 * })
 * generateToken('user123')
 */
export function useGenerateTestToken(options?: UseMutationOptions<TokenResponse, AxiosError, string>) {
  return useMutation({
    mutationFn: authAPI.generateTestToken,
    ...options,
  })
}

// ==================== Session Hooks ====================

/**
 * 세션 목록 조회
 * @param includeInactive - 비활성 세션 포함 여부
 * @example
 * const { data: sessions, isLoading } = useListSessions()
 */
export function useListSessions(includeInactive = false, options?: Omit<UseQueryOptions<ListSessionsResponse, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.sessions.list(includeInactive),
    queryFn: () => sessionAPI.listSessions(includeInactive),
    ...options,
  })
}

/**
 * 새 세션 생성
 * 성공 시 자동으로 세션 목록 캐시를 갱신
 * @example
 * const { mutate: createSession } = useCreateSession({
 *   onSuccess: (newSession) => {
 *     console.log('Created:', newSession.session_id)
 *   }
 * })
 * createSession()
 */
export function useCreateSession(options?: UseMutationOptions<CreateSessionResponse, AxiosError, void>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionAPI.createSession,
    onSuccess: (...args) => {
      // 세션 목록 캐시 무효화 (다시 불러오기)
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
      options?.onSuccess?.(...args)
    },
    ...options,
  })
}

/**
 * 세션 삭제 (비활성화)
 * 성공 시 세션 목록 캐시를 갱신하고 해당 세션 데이터 제거
 * @example
 * const { mutate: deleteSession } = useDeleteSession({
 *   onSuccess: () => {
 *     console.log('Deleted!')
 *   }
 * })
 * deleteSession('session-id-123')
 */
export function useDeleteSession(options?: UseMutationOptions<DeleteSessionResponse, AxiosError, string>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sessionAPI.deleteSession,
    onSuccess: (data, sessionId, ...rest) => {
      // 세션 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
      // 해당 세션의 메시지 캐시 제거
      queryClient.removeQueries({ queryKey: queryKeys.sessions.messages(sessionId) })
      options?.onSuccess?.(data, sessionId, ...rest)
    },
    ...options,
  })
}

// ==================== Message Hooks ====================

/**
 * 세션의 메시지 내역 조회
 * @param sessionId - 세션 UUID
 * @param limit - 메시지 개수 제한 (선택)
 * @example
 * const { data: messages } = useGetSessionMessages('session-123')
 */
export function useGetSessionMessages(sessionId: string, limit?: number, options?: Omit<UseQueryOptions<GetMessagesResponse, AxiosError>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: queryKeys.sessions.messages(sessionId, limit),
    queryFn: () => messageAPI.getSessionMessages(sessionId, limit),
    enabled: !!sessionId, // sessionId가 있을 때만 쿼리 실행
    ...options,
  })
}

/**
 * 메시지 전송 (스트리밍)
 * SSE를 사용하므로 mutation이 아닌 커스텀 함수 반환
 * 전송 완료 후 자동으로 해당 세션의 메시지 캐시를 갱신
 * @example
 * const { sendMessage, isLoading } = useSendMessage()
 *
 * await sendMessage(
 *   { session_id: 'abc', message: '안녕?' },
 *   (chunk) => {
 *     if (!chunk.done) {
 *       setResponse(prev => prev + chunk.text)
 *     }
 *   }
 * )
 */
export function useSendMessage() {
  const queryClient = useQueryClient()

  return {
    sendMessage: async (request: SendMessageRequest, onMessage: (message: StreamMessage) => void, onError?: (error: Error) => void) => {
      try {
        await messageAPI.sendMessage(request, onMessage, onError)
        // 메시지 전송 완료 후 해당 세션의 메시지 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: queryKeys.sessions.messages(request.session_id),
        })
      } catch (error) {
        if (onError) {
          onError(error as Error)
        }
        throw error
      }
    },
  }
}

// ==================== Profile Hooks ====================

/**
 * 프로필 저장 (생성 또는 업데이트)
 * @example
 * const { mutate: saveProfile } = useSaveProfile({
 *   onSuccess: (profile) => {
 *     console.log('Saved:', profile.id)
 *   }
 * })
 *
 * saveProfile({
 *   user_id: 1,
 *   profile_name: '홍길동',
 *   student_id: '20240001',
 *   // ...
 * })
 */
export function useSaveProfile(options?: UseMutationOptions<Profile, AxiosError, ProfileRequest>) {
  return useMutation({
    mutationFn: profileAPI.saveProfile,
    ...options,
  })
}
