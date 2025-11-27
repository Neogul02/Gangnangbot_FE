// import { useNavigate } from 'react-router-dom'
import Background from '../components/Background'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import main_logo from '../assets/main_logo.png'

export default function LoginPage() {
  // const navigate = useNavigate()

  // const handleTestLogin = () => {
  //   // 테스트 로그인 - 바로 채팅 페이지로 이동
  //   navigate('/chat')
  // }

  return (
    <div className='min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8'>
      {/* Background */}
      <div className='absolute inset-0 z-0'>
        <Background />
      </div>

      {/* Login Form */}
      <div className='max-w-md w-full space-y-6 md:space-y-8 relative z-10'>
        <div className='rounded-2xl p-6 md:p-8'>
          <img
            src={main_logo}
            alt='main_logo'
            className='mx-auto mb-6 w-25'
          />
          <div
            className='font-family-kimm font-bold text-3xl text-center mb-6'
            style={{ letterSpacing: '-0.07em' }}>
            강남대학교 AI, 강냉봇
          </div>

          <div className='space-y-4'>
            {/* Google Login Button */}
            <GoogleLoginButton />

            {/* Divider */}
            {/* <div className='relative flex items-center py-2'>
              <div className='grow border-t border-gray-300'></div>
            </div> */}

            {/* Test Login Button */}
            {/* <button
              onClick={handleTestLogin}
              className='cursor-pointer w-full flex items-center justify-center px-4 py-3 border border-main rounded-lg shadow-sm text-sm font-medium text-main bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main transition-colors'>
              TEST Login
            </button>
            <button
              onClick={() => navigate('/api-test')}
              className='cursor-pointer w-full flex items-center justify-center px-4 py-3 border border-main rounded-lg shadow-sm text-sm font-medium text-main bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-main transition-colors'>
              API_TEST
            </button> */}
          </div>
        </div>
      </div>
    </div>
  )
}
