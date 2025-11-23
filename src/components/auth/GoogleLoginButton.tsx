import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface GoogleUser {
  id: string
  name: string
  email: string
  imageUrl: string
}

interface GoogleLoginButtonProps {
  onSuccess?: (user: GoogleUser) => void
  onError?: (error: Error) => void
}

declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void
      auth2: {
        init: (config: { client_id: string; cookiepolicy: string }) => {
          attachClickHandler: (element: HTMLElement, options: Record<string, unknown>, onSuccess: (user: unknown) => void, onError: (error: unknown) => void) => void
        }
      }
    }
  }
}

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const initGoogleAuth = useCallback(() => {
    if (!window.gapi) return

    window.gapi.load('auth2', () => {
      const auth2 = window.gapi.auth2.init({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin',
      })

      if (buttonRef.current) {
        auth2.attachClickHandler(
          buttonRef.current,
          {},
          (googleUser: unknown) => {
            const user = googleUser as {
              getBasicProfile: () => {
                getId: () => string
                getName: () => string
                getEmail: () => string
                getImageUrl: () => string
              }
            }
            const profile = user.getBasicProfile()
            const userData: GoogleUser = {
              id: profile.getId(),
              name: profile.getName(),
              email: profile.getEmail(),
              imageUrl: profile.getImageUrl(),
            }

            if (onSuccess) {
              onSuccess(userData)
            } else {
              // 기본 동작: 채팅 페이지로 이동
              console.log('Google Login Success:', userData)
              navigate('/chat')
            }
          },
          (error: unknown) => {
            console.error('Google Login Error:', error)
            if (onError) {
              onError(error as Error)
            } else {
              alert('로그인에 실패했습니다. 다시 시도해주세요.')
            }
          }
        )
      }
    })
  }, [navigate, onSuccess, onError])

  useEffect(() => {
    // Google API 스크립트 로드
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api:client.js'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = () => {
      initGoogleAuth()
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [initGoogleAuth])

  return (
    <div
      ref={buttonRef}
      className='flex items-center justify-center w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors group'>
      {/* Google Icon */}
      <div className='flex items-center justify-center w-5 h-5 mr-3'>
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
      </div>

      {/* Button Text */}
      <span className='text-sm font-medium text-gray-700 group-hover:text-gray-900'>Google로 로그인</span>
    </div>
  )
}
