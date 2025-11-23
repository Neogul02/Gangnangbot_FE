import { motion } from 'framer-motion'
import main_logo from '../../assets/main_logo.png'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? 370 : 'auto',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className='relative h-full overflow-visible'>
      {/* iOS Style Liquid Glass Background - lg 이상에서만 표시 */}
      <div
        className='absolute inset-0 border-r border-white/30 shadow-2xl lg:block'
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(23px)',
          WebkitBackdropFilter: 'blur(23px)',
        }}
      />

      {/* 열린 사이드바  */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className='relative h-full flex flex-col p-4'>
          <div className='flex items-center justify-between mb-6'>
            <img
              src={main_logo}
              alt='Main Logo'
              className='w-10 h-auto'
            />

            <button
              onClick={onToggle}
              className='p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer'
              aria-label='사이드바 축소'>
              <svg
                className='w-5 h-5 text-main'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M11 19l-7-7 7-7m8 14l-7-7 7-7'
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* 접은 미니 사이드바 */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className='relative h-full flex flex-col items-center cursor-pointer py-4 w-auto lg:w-16'>
          <button
            onClick={onToggle}
            className='relative group lg:mt-0 mt-0 ml-3 lg:ml-0'
            aria-label='사이드바 확대'>
            {/* 동그란 글래스 배경 - 모바일용 (아이콘 배경만) */}
            <div
              className='absolute inset-0 rounded-full shadow-lg lg:hidden transition-all group-hover:scale-110'
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(23px)',
                WebkitBackdropFilter: 'blur(23px)',
              }}
            />
            {/* 아이콘 */}
            <div className='relative p-3 cursor-pointer'>
              <svg
                className='w-5 h-5 text-main'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 5l7 7-7 7M5 5l7 7-7 7'
                />
              </svg>
            </div>
          </button>
        </motion.div>
      )}
    </motion.aside>
  )
}
