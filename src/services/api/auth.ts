import { api, tokenManager } from '../api'
import type { User, TokenResponse } from './types'

// ==================== 인증 API ====================

/**
 * Google OAuth 로그인 페이지로 리다이렉트
 * 백엔드에서 Google OAuth URL을 생성하여 리다이렉트
 * @param from - 로그인 후 돌아갈 경로 ('login' | 'api-test')
 */
export function redirectToGoogleLogin(from: 'login' | 'api-test' = 'login'): void {
  const redirectUri = `${window.location.origin}/auth/callback?from=${from}`
  window.location.href = `${api.defaults.baseURL}/auth/google/login?redirect_uri=${encodeURIComponent(redirectUri)}`
}

/**
 * 현재 로그인된 사용자 정보 조회
 * @requires Authorization: Bearer {access_token}
 */
export async function getMe(): Promise<User> {
  const response = await api.get<User>('/auth/me')
  return response.data
}

/**
 * 테스트용 JWT 토큰 생성 (개발 전용)
 * ⚠️ 프로덕션에서는 사용하지 마세요
 * @param userId - 사용자 ID
 */
export async function generateTestToken(userId: string): Promise<TokenResponse> {
  const response = await api.post<TokenResponse>('/auth/generate-token', null, {
    params: { user_id: userId },
  })
  return response.data
}

/**
 * 로그아웃
 * 토큰을 제거하고 로그인 페이지로 이동
 */
export function logout(): void {
  tokenManager.clear()
  window.location.href = '/login'
}

/**
 * 로그인 상태 확인
 */
export function isAuthenticated(): boolean {
  return tokenManager.isAuthenticated()
}
