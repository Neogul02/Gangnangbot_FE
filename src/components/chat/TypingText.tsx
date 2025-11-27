import { useState, useEffect } from 'react'

interface TypingTextProps {
  texts: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  className?: string
}

export default function TypingText({ texts, typingSpeed = 100, deletingSpeed = 50, pauseDuration = 2000, className = '' }: TypingTextProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const targetText = texts[currentTextIndex]

    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, pauseDuration)
      return () => clearTimeout(pauseTimer)
    }

    if (!isDeleting && currentText === targetText) {
      // 타이핑 완료 - 일시정지
      setIsPaused(true)
      return
    }

    if (isDeleting && currentText === '') {
      // 삭제 완료 - 다음 텍스트로
      setIsDeleting(false)
      setCurrentTextIndex((prev) => (prev + 1) % texts.length)
      return
    }

    const timer = setTimeout(
      () => {
        if (isDeleting) {
          setCurrentText((prev) => prev.slice(0, -1))
        } else {
          setCurrentText((prev) => targetText.slice(0, prev.length + 1))
        }
      },
      isDeleting ? deletingSpeed : typingSpeed
    )

    return () => clearTimeout(timer)
  }, [currentText, isDeleting, isPaused, currentTextIndex, texts, typingSpeed, deletingSpeed, pauseDuration])

  return (
    <h1 className={className}>
      {currentText}
      <span className='animate-pulse'>|</span>
    </h1>
  )
}
