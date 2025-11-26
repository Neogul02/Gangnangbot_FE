import axios, { AxiosError } from 'axios'

// ==================== 환경 설정 ====================
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ==================== Axios 인스턴스 ====================
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30초 타임아웃
})

// ==================== Request 인터셉터 ====================
// 모든 요청에 자동으로 토큰 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ==================== Response 인터셉터 ====================
// 에러 응답 처리 (401 시 자동 로그아웃)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401 Unauthorized - 토큰 만료 또는 유효하지 않음
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      // 로그인 페이지로 리다이렉트 (api-test 페이지는 제외)
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/api-test') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ==================== 토큰 관리 유틸리티 ====================
export const tokenManager = {
  // 토큰 저장
  save: (token: string) => {
    localStorage.setItem('access_token', token)
  },

  // 토큰 가져오기
  get: () => {
    return localStorage.getItem('access_token')
  },

  // 토큰 삭제 (로그아웃)
  clear: () => {
    localStorage.removeItem('access_token')
  },

  // 로그인 상태 확인
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token')
  },
}

// ==================== SSE 스트리밍 헬퍼 ====================
export interface SSEMessage {
  text: string
  done: boolean
}

/**
 * Server-Sent Events (SSE) 스트리밍 처리
 * 챗봇 메시지 전송 시 실시간 응답을 받기 위해 사용
 */
export async function streamSSE(endpoint: string, data: unknown, onMessage: (message: SSEMessage) => void, onError?: (error: Error) => void): Promise<void> {
  const token = tokenManager.get()

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('응답 본문이 없습니다')
    }

    // 스트리밍 데이터 읽기
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))

            // role이 'model'이고 parts에 text가 있는 경우만 처리 (AI의 실제 답변)
            if (data.role !== 'model') {
              continue
            }

            // parts 배열에서 text만 추출 (function_call, function_response 제외)
            let textContent = ''
            if (data.parts && Array.isArray(data.parts)) {
              textContent = data.parts
                .filter((part: { text?: string; function_call?: unknown; function_response?: unknown }) => part.text && !part.function_call && !part.function_response)
                .map((part: { text?: string }) => part.text || '')
                .join('')
            }

            // 텍스트가 없으면 스킵
            if (!textContent) {
              continue
            }

            // 변환된 형식으로 전달
            const message: SSEMessage = {
              text: textContent,
              done: false,
            }

            onMessage(message)
          } catch (e) {
            console.warn('SSE 파싱 오류:', e)
          }
        }
      }
    }
  } catch (error) {
    if (onError) {
      onError(error as Error)
    }
    throw error
  }
}

export default api
