import { motion } from 'framer-motion'

export default function Background() {
  return (
    <div className='absolute inset-0 -z-10 overflow-hidden'>
      {/* Base Background */}
      <div className='absolute inset-0 bg-white' />

      {/* Animated Radial Gradient */}
      <motion.div
        className='absolute inset-0'
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, rgba(124, 206, 255, 0.3) 0%, rgba(124, 206, 255, 0) 70%)',
            'radial-gradient(circle at 45% 48%, rgba(124, 206, 255, 0.35) 0%, rgba(124, 206, 255, 0) 70%)',
            'radial-gradient(circle at 55% 52%, rgba(124, 206, 255, 0.4) 0%, rgba(124, 206, 255, 0) 70%)',
            'radial-gradient(circle at 50% 50%, rgba(124, 206, 255, 0.3) 0%, rgba(124, 206, 255, 0) 70%)',
          ],

          // background:[
          //   'radial-gradient(circle at 50% 50%, rgba(124, 206, 255) 0%, rgba(124, 206, 255, 0) 70%)',
          //   'radial-gradient(circle at 45% 48%, rgba(124, 206, 255, 0.95) 0%, rgba(124, 206, 255, 0) 70%)',
          //   'radial-gradient(circle at 55% 52%, rgba(124, 206, 255, 0.9) 0%, rgba(124, 206, 255, 0) 70%)',
          //   'radial-gradient(circle at 50% 50%, rgba(124, 206, 255, 0.95) 0%, rgba(124, 206, 255, 0) 70%)',
          // ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Floating Accent Circles */}
      <motion.div
        className='absolute top-1/4 left-1/4 w-96 h-96 rounded-full'
        style={{
          background: 'radial-gradient(circle, rgba(124, 206, 255, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className='absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full'
        style={{
          background: 'radial-gradient(circle, rgba(124, 206, 255, 0.12) 0%, transparent 70%)',
          filter: 'blur(35px)',
        }}
        animate={{
          x: [0, -25, 15, 0],
          y: [0, 25, -15, 0],
          scale: [1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  )
}
