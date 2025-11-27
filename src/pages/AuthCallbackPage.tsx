import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { tokenManager } from '../services'
import Background from '../components/Background'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('인증 처리 중...')

  useEffect(() => {
    const handleCallback = async () => {
      // URL에서 파라미터 추출
      const token = searchParams.get('token')
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')
      const from = searchParams.get('from') // 어디서 왔는지 구분 (login or api-test)

      // 디버깅: 받은 파라미터 확인
      console.log('🔍 AuthCallback - 받은 파라미터:', {
        token: token ? `${token.substring(0, 20)}...` : null,
        code: code ? `${code.substring(0, 20)}...` : null,
        state: state ? `${state.substring(0, 20)}...` : null,
        error,
        from,
        fullURL: window.location.href,
      })

      if (error) {
        setStatus('error')
        setMessage(`로그인 실패: ${error}`)
        setTimeout(() => {
          navigate('/login')
        }, 3000)
        return
      }

      // 백엔드가 토큰을 직접 보내준 경우
      if (token) {
        tokenManager.save(token)
        console.log('✅ 토큰 저장 완료')

        setStatus('success')
        setMessage('로그인에 성공했어요')

        setTimeout(() => {
          if (from === 'api-test') {
            navigate('/api-test')
          } else {
            navigate('/chat') // 채팅 페이지로 리다이렉트
          }
        }, 1500)
        return
      }

      // 백엔드가 code만 보내준 경우 - 현재 백엔드가 토큰 교환을 완료하지 않은 상태
      if (code && state) {
        setStatus('error')
        setMessage('백엔드 OAuth 설정이 완료되지 않았습니다. Google 인증은 성공했지만, 백엔드가 JWT 토큰을 프론트엔드에 전달하지 않았습니다. ')
        setTimeout(() => {
          if (from === 'api-test') {
            navigate('/api-test')
          } else {
            navigate('/login')
          }
        }, 5000)
        return
      }

      // code도 token도 없는 경우
      setStatus('error')
      setMessage('인증 정보를 찾을 수 없습니다.')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className='min-h-screen flex items-center justify-center relative overflow-hidden'>
      {/* Background */}
      <div className='absolute inset-0 z-0'>
        <Background />
      </div>

      {/* Content */}
      <div className='relative z-10 max-w-md w-full mx-4'>
        <div
          className='rounded-2xl p-8 text-center border border-white/30 shadow-2xl'
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(23px)',
            WebkitBackdropFilter: 'blur(23px)',
          }}>
          {status === 'loading' && (
            <>
              <div className='w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin mx-auto mb-4' />
              <h2 className='text-2xl font-bold text-main mb-2'>로그인 처리 중</h2>
              <p className='text-gray-700'>{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-10 h-10 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-green-600 mb-2'>로그인 성공</h2>
              <p className='text-gray-700'>{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className='w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-10 h-10 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </div>
              <h2 className='text-2xl font-bold text-red-600 mb-2'>로그인 실패</h2>
              <p className='text-gray-700'>{message}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
