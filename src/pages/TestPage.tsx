import { useState } from 'react'
import Background from '../components/Background'
import {
  // Auth API
  getMe,
  generateTestToken,
  logout,
  isAuthenticated,
  tokenManager,
  redirectToGoogleLogin,
  // Session API
  createSession,
  listSessions,
  deleteSession,
  // Message API
  getSessionMessages,
  sendMessage,
  // Profile API
  saveProfile,
  // Types
  type TokenResponse,
  type CreateSessionResponse,
  type ListSessionsResponse,
  type GetMessagesResponse,
  type Profile,
} from '../services'

export default function TestPage() {
  const [userId, setUserId] = useState('test-user-123')
  const [sessionId, setSessionId] = useState('')
  const [message, setMessage] = useState('안녕하세요, 테스트 메시지입니다.')
  const [streamResponse, setStreamResponse] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  // 로그 추가 헬퍼
  const addLog = (message: string, data?: unknown) => {
    const timestamp = new Date().toLocaleTimeString('ko-KR')
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage, data || '')
    setLogs((prev) => [...prev, logMessage + (data ? `\n${JSON.stringify(data, null, 2)}` : '')])
  }

  // ==================== Auth API Tests ====================

  const testGenerateToken = async () => {
    try {
      addLog('🔑 테스트 토큰 생성 시도...', { user_id: userId })
      const response: TokenResponse = await generateTestToken(userId)
      tokenManager.save(response.access_token)
      addLog('✅ 토큰 생성 성공!', response)

      // 토큰 생성 후 자동으로 프로필 저장 (백엔드가 user_id 검증을 위해 필요)
      addLog('👨‍🎓 프로필 자동 저장 시도...')
      try {
        const profile: Profile = await saveProfile({
          user_id: 1,
          profile_name: `${userId}_프로필`,
          student_id: '202004123',
          college: '공과대학',
          department: '소프트웨어학부',
          major: '소프트웨어전공',
          current_grade: 4,
          current_semester: 2,
        })
        addLog('✅ 프로필 자동 저장 성공! 이제 세션을 생성할 수 있습니다.', profile)
      } catch (profileError) {
        addLog('⚠️ 프로필 저장 실패 (이미 존재하거나 다른 이유)', profileError)
        addLog('ℹ️ 세션 생성은 시도할 수 있습니다.')
      }
    } catch (error) {
      addLog('❌ 토큰 생성 실패', error)
    }
  }

  const testGetMe = async () => {
    try {
      addLog('👤 사용자 정보 조회 시도...')
      const user = await getMe()
      addLog('✅ 사용자 정보 조회 성공!', user)
    } catch (error) {
      addLog('❌ 사용자 정보 조회 실패', error)
    }
  }

  const testIsAuthenticated = () => {
    const auth = isAuthenticated()
    addLog(`🔐 로그인 상태: ${auth ? '로그인됨' : '로그아웃됨'}`)
  }

  const testLogout = () => {
    logout()
    addLog('🚪 로그아웃 완료')
  }

  const testGoogleLogin = () => {
    addLog('🔑 Google OAuth 로그인 페이지로 리다이렉트...')
    addLog('⚠️ 백엔드 서버가 실행 중이어야 합니다.')
    addLog('✅ 성공 시 /auth/callback?token=... 으로 리다이렉트되며 다시 이 페이지로 돌아옵니다.')
    redirectToGoogleLogin('api-test')
  }

  // ==================== Session API Tests ====================

  const testCreateSession = async () => {
    try {
      addLog('📝 세션 생성 시도...')
      const session: CreateSessionResponse = await createSession()
      setSessionId(session.session_id)
      addLog('✅ 세션 생성 성공!', session)
    } catch (error) {
      addLog('❌ 세션 생성 실패', error)
    }
  }

  const testListSessions = async () => {
    try {
      addLog('📋 세션 목록 조회 시도...')
      const sessions: ListSessionsResponse = await listSessions(false)
      addLog('✅ 세션 목록 조회 성공!', sessions)
    } catch (error) {
      addLog('❌ 세션 목록 조회 실패', error)
    }
  }

  const testListSessionsWithInactive = async () => {
    try {
      addLog('📋 세션 목록 조회 (비활성 포함) 시도...')
      const sessions: ListSessionsResponse = await listSessions(true)
      addLog('✅ 세션 목록 조회 성공!', sessions)
    } catch (error) {
      addLog('❌ 세션 목록 조회 실패', error)
    }
  }

  const testDeleteSession = async () => {
    if (!sessionId) {
      addLog('⚠️ 세션 ID가 없습니다. 먼저 세션을 생성하세요.')
      return
    }
    try {
      addLog('🗑️ 세션 삭제 시도...', { session_id: sessionId })
      const result = await deleteSession(sessionId)
      addLog('✅ 세션 삭제 성공!', result)
      setSessionId('')
    } catch (error) {
      addLog('❌ 세션 삭제 실패', error)
    }
  }

  // ==================== Message API Tests ====================

  const testGetMessages = async () => {
    if (!sessionId) {
      addLog('⚠️ 세션 ID가 없습니다. 먼저 세션을 생성하세요.')
      return
    }
    try {
      addLog('💬 메시지 내역 조회 시도...', { session_id: sessionId })
      const messages: GetMessagesResponse = await getSessionMessages(sessionId)
      addLog('✅ 메시지 내역 조회 성공!', messages)
    } catch (error) {
      addLog('❌ 메시지 내역 조회 실패', error)
    }
  }

  const testSendMessage = async () => {
    if (!sessionId) {
      addLog('⚠️ 세션 ID가 없습니다. 먼저 세션을 생성하세요.')
      return
    }
    try {
      addLog('📤 메시지 전송 시도 (SSE 스트리밍)...', { session_id: sessionId, message })
      setStreamResponse('')

      await sendMessage(
        { session_id: sessionId, message },
        (chunk) => {
          if (!chunk.done) {
            setStreamResponse((prev) => prev + chunk.text)
            console.log('📨 스트리밍 청크:', chunk.text)
          } else {
            addLog('✅ 메시지 전송 완료!')
          }
        },
        (error) => {
          addLog('❌ 메시지 전송 실패', error)
        }
      )
    } catch (error) {
      addLog('❌ 메시지 전송 실패', error)
    }
  }

  // ==================== Profile API Tests ====================

  const testSaveProfile = async () => {
    try {
      addLog('👨‍🎓 프로필 저장 시도...')
      const profile: Profile = await saveProfile({
        user_id: 1,
        profile_name: '최진형_테스트',
        student_id: '202004123',
        college: '공과대학',
        department: '소프트웨어학부',
        major: '소프트웨어전공',
        current_grade: 4,
        current_semester: 2,
      })
      addLog('✅ 프로필 저장 성공!', profile)
    } catch (error) {
      addLog('❌ 프로필 저장 실패', error)
    }
  }

  // ==================== All Tests ====================

  const runAllTests = async () => {
    addLog('🚀 전체 테스트 시작...')
    await testGenerateToken()
    await new Promise((resolve) => setTimeout(resolve, 500))
    await testGetMe()
    await new Promise((resolve) => setTimeout(resolve, 500))
    await testCreateSession()
    await new Promise((resolve) => setTimeout(resolve, 500))
    await testListSessions()
    await new Promise((resolve) => setTimeout(resolve, 500))
    await testSendMessage()
    await new Promise((resolve) => setTimeout(resolve, 1000))
    await testGetMessages()
    await new Promise((resolve) => setTimeout(resolve, 500))
    await testSaveProfile()
    addLog('🎉 전체 테스트 완료!')
  }

  const clearLogs = () => {
    setLogs([])
    setStreamResponse('')
    console.clear()
  }

  return (
    <div className='min-h-screen flex items-center justify-center relative overflow-hidden'>
      {/* Background */}
      <div className='absolute inset-0 z-0'>
        <Background />
      </div>

      <div className='w-full max-w-7xl mx-auto p-4 md:p-8 relative z-10'>
        {/* Header with Logo */}
        <div
          className='flex items-center justify-center gap-4 mb-6 md:mb-8 rounded-2xl p-4 md:p-6 border border-white/30 shadow-2xl'
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(23px)',
            WebkitBackdropFilter: 'blur(23px)',
          }}>
          <h1 className='text-3xl md:text-4xl font-bold text-main'>API TEST</h1>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Left Column: Controls */}
          <div className='space-y-6'>
            {/* Auth Tests */}
            <div
              className='rounded-2xl p-4 md:p-6 border border-white/30 shadow-2xl'
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(23px)',
                WebkitBackdropFilter: 'blur(23px)',
              }}>
              <h2 className='text-xl md:text-2xl font-bold text-main mb-4'>Auth</h2>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>User ID</label>
                  <input
                    type='text'
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md'
                    placeholder='test-user-123'
                  />
                </div>
                <button
                  onClick={testGoogleLogin}
                  className='w-full bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 text-left border border-gray-300 shadow-sm'>
                  <div className='font-bold flex items-center gap-2'>
                    <svg
                      viewBox='0 0 24 24'
                      className='w-5 h-5'>
                      <path
                        fill='#4285F4'
                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                      />
                      <path
                        fill='#34A853'
                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                      />
                      <path
                        fill='#FBBC05'
                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                      />
                      <path
                        fill='#EA4335'
                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                      />
                    </svg>
                    Google 로그인
                  </div>
                  <div className='text-xs opacity-80 mt-1'>GET /auth/google/login (리다이렉트)</div>
                </button>
                <button
                  onClick={testGenerateToken}
                  className='w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-left'>
                  <div className='font-bold'>토큰 생성</div>
                  <div className='text-xs opacity-80 mt-1'>POST /auth/generate-token</div>
                </button>
                <button
                  onClick={testGetMe}
                  className='w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-left'>
                  <div className='font-bold'>사용자 정보 조회</div>
                  <div className='text-xs opacity-80 mt-1'>GET /auth/me</div>
                </button>
                <button
                  onClick={testIsAuthenticated}
                  className='w-full bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 text-left'>
                  <div className='font-bold'>로그인 상태 확인</div>
                  <div className='text-xs opacity-80 mt-1'>로컬 토큰 체크 (API 호출 없음)</div>
                </button>
                <button
                  onClick={testLogout}
                  className='w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-left'>
                  <div className='font-bold'>로그아웃</div>
                  <div className='text-xs opacity-80 mt-1'>로컬 토큰 삭제 (API 호출 없음)</div>
                </button>
              </div>
            </div>

            {/* Session Tests */}
            <div
              className='rounded-2xl p-4 md:p-6 border border-white/30 shadow-2xl'
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(23px)',
                WebkitBackdropFilter: 'blur(23px)',
              }}>
              <h2 className='text-xl md:text-2xl font-bold text-main mb-4'>Session</h2>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Session ID</label>
                  <input
                    type='text'
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md'
                    placeholder='자동으로 설정됨'
                  />
                </div>
                <button
                  onClick={testCreateSession}
                  className='w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-left'>
                  <div className='font-bold'>세션 생성</div>
                  <div className='text-xs opacity-80 mt-1'>POST /sessions/</div>
                </button>
                <button
                  onClick={testListSessions}
                  className='w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-left'>
                  <div className='font-bold'>세션 목록 조회</div>
                  <div className='text-xs opacity-80 mt-1'>GET /sessions/</div>
                </button>
                <button
                  onClick={testListSessionsWithInactive}
                  className='w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 text-left'>
                  <div className='font-bold'>세션 목록 (비활성 포함)</div>
                  <div className='text-xs opacity-80 mt-1'>GET /sessions/?include_inactive=true</div>
                </button>
                <button
                  onClick={testDeleteSession}
                  className='w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 text-left disabled:opacity-50'
                  disabled={!sessionId}>
                  <div className='font-bold'>세션 삭제</div>
                  <div className='text-xs opacity-80 mt-1'>DELETE /sessions/{'{session_id}'}</div>
                </button>
              </div>
            </div>

            {/* Message Tests */}
            <div
              className='rounded-2xl p-4 md:p-6 border border-white/30 shadow-2xl'
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(23px)',
                WebkitBackdropFilter: 'blur(23px)',
              }}>
              <h2 className='text-xl md:text-2xl font-bold text-main mb-4'>Message</h2>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>메시지</label>
                  <input
                    type='text'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md'
                    placeholder='테스트 메시지'
                  />
                </div>
                <button
                  onClick={testSendMessage}
                  className='w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-left disabled:opacity-50'
                  disabled={!sessionId}>
                  <div className='font-bold'>메시지 전송 (SSE)</div>
                  <div className='text-xs opacity-80 mt-1'>POST /chat/message (SSE 스트리밍)</div>
                </button>
                <button
                  onClick={testGetMessages}
                  className='w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-left disabled:opacity-50'
                  disabled={!sessionId}>
                  <div className='font-bold'>메시지 내역 조회</div>
                  <div className='text-xs opacity-80 mt-1'>GET /sessions/{'{session_id}'}/messages</div>
                </button>
                {streamResponse && (
                  <div className='p-3 bg-blue-50 rounded-md'>
                    <p className='text-sm font-medium text-gray-700 mb-1'>📨 실시간 응답:</p>
                    <p className='text-sm text-gray-900'>{streamResponse}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Tests */}
            <div
              className='rounded-2xl p-4 md:p-6 border border-white/30 shadow-2xl'
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(23px)',
                WebkitBackdropFilter: 'blur(23px)',
              }}>
              <h2 className='text-xl md:text-2xl font-bold text-main mb-4'>Profile</h2>
              <div className='space-y-3'>
                <button
                  onClick={testSaveProfile}
                  className='w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-left'>
                  <div className='font-bold'>프로필 저장 (샘플 데이터)</div>
                  <div className='text-xs opacity-80 mt-1'>POST /profiles/</div>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className='rounded-2xl p-4 md:p-6 border border-white/30 shadow-2xl'
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(23px)',
                WebkitBackdropFilter: 'blur(23px)',
              }}>
              <h2 className='text-xl md:text-2xl font-bold text-main mb-4'>Quick</h2>
              <div className='space-y-3'>
                <button
                  onClick={runAllTests}
                  className='w-full bg-linear-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-pink-600 font-bold'>
                  🚀 전체 테스트 실행
                </button>
                <button
                  onClick={clearLogs}
                  className='w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600'>
                  🧹 로그 지우기
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Console Logs & Environment Info */}
          <div className='space-y-4'>
            {/* Console Logs */}
            <div className='rounded-2xl p-4 md:p-6 border border-white/10 bg-black/80 shadow-2xl'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl md:text-2xl font-bold text-white'>Console.log</h2>
                <span className='text-xs md:text-sm text-gray-400'>{logs.length} 개의 로그</span>
              </div>
              <div className='space-y-2 font-mono text-sm max-h-[calc(100vh-32rem)] overflow-y-auto'>
                {logs.length === 0 ? (
                  <p className='text-gray-500'>로그가 없습니다. 테스트를 실행하세요.</p>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className='text-green-400 whitespace-pre-wrap wrap-break-word'>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Environment Info */}
            <div
              className='rounded-2xl p-4 border border-yellow-200/50 shadow-2xl'
              style={{
                backgroundColor: 'rgba(254, 252, 232, 0.4)',
                backdropFilter: 'blur(23px)',
                WebkitBackdropFilter: 'blur(23px)',
              }}>
              <h3 className='font-bold text-yellow-800 mb-2'>Environment Info</h3>
              <div className='text-xs md:text-sm text-yellow-700 space-y-2'>
                <p>
                  <strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL}
                </p>
                <p>
                  <strong>로그인 상태:</strong> {isAuthenticated() ? '✅ 로그인됨' : '❌ 로그아웃됨'}
                </p>
                <div>
                  <strong>현재 토큰:</strong>
                  {tokenManager.get() ? <div className='mt-1 p-2 bg-yellow-100/50 rounded border border-yellow-300/50 font-mono text-xs break-all'>{tokenManager.get()}</div> : <span className='ml-2'>❌ 없음</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
