import { api } from '../api'
import type { ProfileRequest, Profile } from './types'

// ==================== 프로필 API ====================

/**
 * 사용자 프로필 저장 (생성 또는 업데이트)
 * user_id를 기준으로 기존 프로필이 있으면 업데이트, 없으면 새로 생성
 * @param profile - 프로필 정보 (학번, 학과, 학년 등)
 * @requires Authorization: Bearer {access_token}
 *
 * @example
 * await saveProfile({
 *   user_id: 1,
 *   profile_name: '홍길동',
 *   student_id: '20240001',
 *   college: '공과대학',
 *   department: '소프트웨어학부',
 *   major: '소프트웨어전공',
 *   current_grade: 3,
 *   current_semester: 1
 * })
 */
export async function saveProfile(profile: ProfileRequest): Promise<Profile> {
  const response = await api.post<Profile>('/profiles/', profile)
  return response.data
}
