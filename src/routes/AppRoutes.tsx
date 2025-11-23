import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import LoginPage from '../pages/LoginPage'
import ChatPage from '../pages/ChatPage'

const pageVariants = {
  initial: {
    opacity: 0,
    x: 40,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -40,
  },
}

const pageTransition = {
  duration: 0.6,
  ease: 'easeInOut' as const,
}

export default function AppRoutes() {
  const location = useLocation()

  return (
    <div className='overflow-hidden'>
      <AnimatePresence mode='wait'>
        <Routes
          location={location}
          key={location.pathname}>
          <Route
            path='/login'
            element={
              <motion.div
                initial='initial'
                animate='animate'
                exit='exit'
                variants={pageVariants}
                transition={pageTransition}>
                <LoginPage />
              </motion.div>
            }
          />
          <Route
            path='/chat'
            element={
              <motion.div
                initial='initial'
                animate='animate'
                exit='exit'
                variants={pageVariants}
                transition={pageTransition}>
                <ChatPage />
              </motion.div>
            }
          />
          <Route
            path='/'
            element={
              <Navigate
                to='/login'
                replace
              />
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  )
}
