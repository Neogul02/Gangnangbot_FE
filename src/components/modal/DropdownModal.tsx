import { motion, AnimatePresence } from 'framer-motion'

interface DropdownModalProps {
  isOpen: boolean
  onClose: () => void
  options: string[]
  onSelect: (value: string) => void
  selectedValue: string
  label: string
}

export default function DropdownModal({ isOpen, onClose, options, onSelect, selectedValue, label }: DropdownModalProps) {
  const handleSelect = (value: string) => {
    onSelect(value)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/30 backdrop-blur-sm z-[60]'
          />

          {/* 드롭다운 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[60]'>
            <div
              className='rounded-3xl p-6 border border-white/30 shadow-2xl max-h-[70vh] flex flex-col'
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(23px)',
                WebkitBackdropFilter: 'blur(23px)',
              }}>
              {/* 헤더 */}
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-gray-800'>{label}</h3>
                <button
                  onClick={onClose}
                  className='text-gray-400 hover:text-gray-600 transition-colors'
                  aria-label='닫기'>
                  <svg
                    className='w-6 h-6'
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
                </button>
              </div>

              {/* 옵션 리스트 */}
              <div className='overflow-y-auto flex-1'>
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition-all ${selectedValue === option ? 'bg-blue-500 text-white font-medium' : 'bg-gray-50 hover:bg-gray-100 text-gray-800'}`}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
