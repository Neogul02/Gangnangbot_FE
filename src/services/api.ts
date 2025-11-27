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

  console.log('🚀 streamSSE 시작:', { endpoint, data })

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    console.log('📡 fetch 응답 수신:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
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
    let isStreamingDone = false
    let chunkCount = 0
    while (true) {
      console.log(`📖 reader.read() 호출 (청크 #${chunkCount + 1})`)
      const { done, value } = await reader.read()
      console.log(`📥 reader.read() 결과:`, { done, valueLength: value?.length })

      if (done) {
        console.log('🏁 reader 스트림 종료 (done: true)')
        break
      }

      chunkCount++
      const chunk = decoder.decode(value)
      console.log(`📦 청크 #${chunkCount} 디코딩 완료:`, { length: chunk.length, preview: chunk.substring(0, 100) })

      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            console.log('🔍 SSE 데이터 파싱:', data)

            // 1. 텍스트 응답 처리 (text 필드만 있어도 처리)
            if ('text' in data) {
              const isDone = 'done' in data ? data.done : false
              console.log('✅ text 형식 감지:', { textLength: data.text?.length, done: isDone })

              // 텍스트가 있으면 전달
              if (data.text) {
                const message: SSEMessage = {
                  text: data.text,
                  done: isDone,
                }
                console.log('📤 onMessage 호출:', message)
                onMessage(message)
              }

              // done: true이고 text가 비어있으면 스트리밍 종료 신호
              if (isDone && !data.text) {
                const message: SSEMessage = {
                  text: '',
                  done: true,
                }
                onMessage(message)
              }

              // done: true 받으면 스트리밍 종료
              if (isDone) {
                console.log('🏁 done:true 수신, 스트리밍 종료')
                isStreamingDone = true
                reader.cancel()
                break
              }

              // done 필드가 없어도 계속 처리
              continue
            }

            // 2. Vertex AI 원본 응답 (parts, role 필드) - 마크다운 처리용
            if (data.parts && Array.isArray(data.parts) && data.role === 'model') {
              let textContent = ''
              for (const part of data.parts) {
                if (typeof part === 'object' && part !== null) {
                  // 'text' 키를 가진 경우 직접 추출
                  if ('text' in part && typeof part.text === 'string') {
                    textContent += part.text
                  }
                  // 'parts' 배열을 가진 중첩 구조인 경우
                  else if ('parts' in part && Array.isArray(part.parts)) {
                    for (const nestedPart of part.parts) {
                      if (nestedPart && typeof nestedPart === 'object' && 'text' in nestedPart) {
                        textContent += nestedPart.text
                      }
                    }
                  }
                }
              }

              // 텍스트가 있으면 마크다운 렌더링용으로 전달
              if (textContent) {
                const message: SSEMessage = {
                  text: textContent,
                  done: false,
                }
                onMessage(message)
              }
              continue
            }

            // 3. 에러 처리
            if (data.error) {
              if (onError) {
                onError(new Error(data.text || '알 수 없는 오류가 발생했습니다'))
              }
            }
          } catch (e) {
            console.warn('SSE 파싱 오류:', e)
          }
        }

        // 내부 루프에서 done 신호 받으면 외부 루프도 종료
        if (isStreamingDone) break
      }

      // 외부 루프에서도 done 신호 확인
      if (isStreamingDone) break
    }

    console.log('✅ SSE 스트리밍 완전 종료')
  } catch (error) {
    if (onError) {
      onError(error as Error)
    }
    throw error
  }
}

export default api
