import { motion } from 'framer-motion'
import main_logo from '../../assets/main_logo.png'
import SidebarToggleButton from './SidebarToggleButton'

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
      className='relative h-full overflow-visible hidden lg:block'>
      {/* iOS Style Liquid Glass Background */}
      <div
        className='absolute inset-0 border-r border-white/30 shadow-2xl'
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
          transition={{ duration: 0.3, delay: 0.1 }}
          className='relative h-full flex flex-col p-4'>
          <div className='flex items-center justify-between mb-6'>
            <img
              src={main_logo}
              alt='Main Logo'
              className='w-10 h-auto'
            />
            <SidebarToggleButton
              isOpen={isOpen}
              onClick={onToggle}
            />
          </div>
        </motion.div>
      )}

      {/* 접은 미니 사이드바 */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
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
