import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Background from '../components/Background'
import Sidebar from '../components/chat/Sidebar'
import ChatArea from '../components/chat/ChatArea'
import SidebarToggleButton from '../components/chat/SidebarToggleButton'
import SessionList from '../components/chat/SessionList'
import ProfileSection from '../components/chat/ProfileSection'
import main_logo from '../assets/main_logo.png'
import { getMe } from '../services/api/auth'
import { useUserStore } from '../store/useUserStore'

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const setUser = useUserStore((state) => state.setUser)

  // 페이지 로드 시 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await getMe()
        setUser(userInfo)
        console.log('✅ 사용자 정보 로드:', userInfo)
      } catch (error) {
        console.error('❌ 사용자 정보 로드 실패:', error)
      }
    }

    fetchUserInfo()
  }, [setUser])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className='min-h-screen flex relative'>
      {/* Background - Always in the back */}
      <div className='fixed inset-0 -z-50 lg:-left-[50%] left-0'>
        <Background />
      </div>

      {/* Layout */}
      <div className='flex w-full h-screen overflow-hidden '>
        {/* Sidebar - Desktop only */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />

        {/* Mobile Menu Button - Mobile only */}
        {!isSidebarOpen && (
          <div className='lg:hidden'>
            <SidebarToggleButton
              isOpen={false}
              onClick={toggleSidebar}
              isMobile={true}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence mode='wait'>
          {isSidebarOpen && (
            <div className='lg:hidden fixed inset-0 z-40'>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className='absolute inset-0'
                onClick={toggleSidebar}
              />
              {/* Mobile Sidebar */}
              <motion.div
                initial={{ x: -370 }}
                animate={{ x: 0 }}
                exit={{ x: -370 }}
                transition={{
                  duration: 0.3,
                  ease: 'easeInOut',
                }}
                className='relative w-[370px] h-full shadow-2xl'
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(23px)',
                  WebkitBackdropFilter: 'blur(23px)',
                }}>
                <div className='relative h-full flex flex-col p-4'>
                  <div className='flex items-center justify-between mb-6'>
                    <img
                      src={main_logo}
                      alt='Main Logo'
                      className='w-10 h-auto'
                    />
                    <SidebarToggleButton
                      isOpen={true}
                      onClick={toggleSidebar}
                    />
                  </div>
                  {/* 채팅 세션 목록 */}
                  <div className='flex-1 overflow-hidden min-h-0'>
                    <SessionList />
                  </div>

                  {/* 프로필 섹션 */}
                  <ProfileSection />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <ChatArea />
      </div>
    </div>
  )
}
