import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { logout } from '../../services/api/auth'
import SettingModal from './SettingModal'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  userPicture?: string
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const handleSettings = () => {
    setIsSettingModalOpen(true)
    onClose() // ProfileModal 닫기
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 z-50'
          />

          {/* Modal */}
          <div className='fixed bottom-25 left-6 z-50 pointer-events-none'>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className='w-48 pointer-events-auto relative'
              style={{
                filter: 'drop-shadow(0px 0px 15px rgba(105, 162, 255, 0.24))',
              }}>
              {/* 배경 */}
              <div className='absolute inset-0 bg-white/50 rounded-xl backdrop-blur-md' />

              {/* 컨텐츠 */}
              <div className='relative'>
                {/* 설정 버튼 */}
                <button
                  onClick={handleSettings}
                  className='cursor-pointer w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/50 transition-colors rounded-t-xl'>
                  <div className='w-8 h-8 flex items-center justify-center'>
                    <svg
                      className='w-5 h-5 text-gray-800'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                    </svg>
                  </div>
                  <span className='text-gray-800 text-lg font-semibold font-pretendard'>설정</span>
                </button>

                {/* 로그아웃 버튼 */}
                <button
                  onClick={handleLogout}
                  className='cursor-pointer w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/50 transition-colors rounded-b-xl'>
                  <div className='w-8 h-8 flex items-center justify-center'>
                    <svg
                      className='w-5 h-5 text-gray-800'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                      />
                    </svg>
                  </div>
                  <span className='text-gray-800 text-lg font-semibold font-pretendard'>로그아웃</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* 설정 모달 */}
      <SettingModal
        isOpen={isSettingModalOpen}
        onClose={() => setIsSettingModalOpen(false)}
      />
    </AnimatePresence>
  )
}
