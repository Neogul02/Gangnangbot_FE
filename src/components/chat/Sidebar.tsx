import { motion } from 'framer-motion'
import main_logo from '../../assets/main_logo.png'
import text_logo from '../../assets/text_logo.png'
import SidebarToggleButton from './SidebarToggleButton'
import SessionList from './SessionList'
import ProfileSection from './ProfileSection'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? 370 : 64,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className='relative h-full overflow-hidden hidden lg:block'>
      {/* iOS Style Liquid Glass Background */}
      <div
        className='absolute inset-0 border-r border-white/30 shadow-2xl bg-white/5 lg:bg-white/30'
        style={{
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        }}
      />

      {/* 열린 사이드바  */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.05, ease: 'easeInOut' }}
          className='relative h-full flex flex-col p-6'>
          <div className='flex items-center justify-between mb-6 ml-2'>
            <img
              src={main_logo}
              alt='Main Logo'
              className='w-10 h-auto'
            />
            <img
              src={text_logo}
              alt='Text Logo'
              className='-ml-25'
            />
            <SidebarToggleButton
              isOpen={isOpen}
              onClick={onToggle}
            />
          </div>
          {/* 채팅 세션 목록 */}
          <div className='flex-1 overflow-hidden min-h-0'>
            <SessionList />
          </div>

          {/* 프로필 섹션 */}
          <ProfileSection />
        </motion.div>
      )}

      {/* 접은 미니 사이드바 */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.06, ease: 'easeInOut' }}
          className='relative h-full flex flex-col items-center py-4 w-16'>
          <div className='p-1'>
            <SidebarToggleButton
              isOpen={isOpen}
              onClick={onToggle}
            />
          </div>
        </motion.div>
      )}
    </motion.aside>
  )
}
