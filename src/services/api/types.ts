// ==================== API 응답 타입 정의 ====================

// ========== Auth (인증) ==========
export interface User {
  id: number
  email: string
  name: string
  picture?: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user_id: string
  note: string
}

// ========== Session (세션) ==========
export interface Session {
  sid: string // 세션 ID (UUID)
  title: string // 세션 제목
  is_active: boolean // 활성 상태
  created_at: string // 생성 시간 (ISO 8601)
}

export interface CreateSessionResponse {
  session_id: string
  user_id: number
  title: string
  created_at?: string
}

export interface ListSessionsResponse {
  sessions: Session[]
}

export interface DeleteSessionResponse {
  message: string
}

// ========== Message (메시지) ==========
export interface Message {
  role: string // 'user' | 'assistant'
  content: string // 메시지 내용
  created_at: string // 생성 시간 (ISO 8601)
}

export interface GetMessagesResponse {
  session_id: string
  messages: Message[]
}

export interface SendMessageRequest {
  session_id: string
  message: string
}

// SSE 스트리밍 응답
export interface StreamMessage {
  text: string
  done: boolean
}

// ========== Profile (프로필) ==========
export interface ProfileRequest {
  user_id: number
  profile_name: string // 프로필 이름
  student_id: string // 학번
  college: string // 단과대학
  department: string // 학부/학과
  major: string // 전공
  current_grade: number // 현재 학년
  current_semester: number // 현재 학기
}

export interface Profile extends ProfileRequest {
  id: number
  created_at?: string
  updated_at?: string
}
