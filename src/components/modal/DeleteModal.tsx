import { motion, AnimatePresence } from 'framer-motion'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
}

export default function DeleteModal({ isOpen, onClose, onConfirm, title, message, confirmText = '삭제', cancelText = '취소' }: DeleteModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
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
            className='fixed inset-0 bg-black/10 backdrop-blur-sm z-50'
          />

          {/* Modal */}
          <div className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none '>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className='bg-white rounded-2xl shadow-2xl w-[90%] max-w-sm pointer-events-auto overflow-hidden'>
              {/* Modal Content */}
              <div className='p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>{title}</h3>
                {message && <p className='text-sm text-gray-600 mb-6'>{message}</p>}

                {/* Buttons */}
                <div className='flex gap-3'>
                  <button
                    onClick={onClose}
                    className='cursor-pointer flex-1 px-4 py-2.5 bg-gray-100/70 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition'>
                    {cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className='cursor-pointer flex-1 px-4 py-2.5 bg-red-500/70 hover:bg-red-600 text-white rounded-xl font-medium transition'>
                    {confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
