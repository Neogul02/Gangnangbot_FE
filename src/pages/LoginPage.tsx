import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'

export default function LoginPage() {
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // 테스트 로그인 - 바로 채팅 페이지로 이동
    navigate('/chat')
  }

  return (
    <div className='min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8 '>
      {/* Background */}
      <div className='absolute inset-0 z-0 '>
        <Background />
      </div>

      {/* Login Form */}
      <div className='max-w-md w-full space-y-6 md:space-y-8 relative z-10'>
        <div className='bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-8'>
          <button
            onClick={handleLogin}
            className='cursor-pointer w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-main hover:bg-main-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main transition-colors'>
            간편 로그인 (테스트용)
          </button>
        </div>
      </div>
    </div>
  )
}
