import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import main_logo from '../../assets/main_logo.png'
import { useSessionStore } from '../../store/useSessionStore'
import { createSession, sendMessage, getSessionMessages } from '../../services'
import { queryKeys } from '../../services/hooks'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

const EXAMPLE_QUESTIONS = ['오늘 급식 뭐야?', '홍길동 교수님 수업 알려줘', '교학2팀이 어디야?']

export default function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('') // 스트리밍 중인 AI 응답
  const [isNewSession, setIsNewSession] = useState(false) // 새 세션 생성 플래그
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const queryClient = useQueryClient()
  const { currentSessionId, setCurrentSessionId } = useSessionStore()

  const hasMessages = messages.length > 0

  // 메시지 전송 시 스크롤 하단으로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // 세션의 메시지 내역 불러오기
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const response = await getSessionMessages(sessionId)
      const loadedMessages: Message[] = response.messages.map((msg, index) => ({
        id: `${sessionId}-${index}`,
        type: msg.role === 'user' ? 'user' : 'ai',
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }))
      setMessages(loadedMessages)
    } catch (error) {
      console.error('메시지 불러오기 실패:', error)
    }
  }, [])

  // 세션이 변경되면 메시지 불러오기
  useEffect(() => {
    if (currentSessionId && !isNewSession) {
      // 새 세션이 아닐 때만 메시지 불러오기
      console.log('📥 세션 메시지 불러오기:', currentSessionId)
      loadSessionMessages(currentSessionId)
    } else if (!currentSessionId) {
      // 세션이 없으면 메시지 초기화 (새 채팅 시작)
      console.log('🆕 메시지 초기화')
      setMessages([])
    }

    // 플래그 리셋
    if (isNewSession) {
      setIsNewSession(false)
    }
  }, [currentSessionId, loadSessionMessages, isNewSession])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) {
      console.log('⚠️ 전송 중단:', { hasInput: !!inputValue.trim(), isLoading })
      return
    }

    console.log('🚀 handleSendMessage 호출됨')
    const userMessageContent = inputValue.trim()
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setStreamingContent('')

    try {
      let sessionId = currentSessionId

      // 세션이 없으면 새로 생성
      if (!sessionId) {
        console.log('📝 새 세션 생성 중...')
        const newSession = await createSession()
        sessionId = newSession.session_id
        setIsNewSession(true) // 새 세션 플래그 설정
        setCurrentSessionId(sessionId)
        console.log('✅ 세션 생성 완료:', sessionId)

        // 세션 목록 캐시 무효화 (SessionList 갱신)
        queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
      }

      // 메시지 전송 (SSE 스트리밍)
      console.log('📤 메시지 전송 중...')
      let fullAIResponse = ''

      await sendMessage(
        { session_id: sessionId, message: userMessageContent },
        (chunk) => {
          // 스트리밍 중 - 텍스트 누적
          fullAIResponse += chunk.text
          setStreamingContent(fullAIResponse)
        },
        (error) => {
          console.error('❌ 메시지 전송 실패:', error)
          setStreamingContent('')
          setIsLoading(false)

          // 에러 메시지 표시
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: '죄송합니다. 메시지 전송에 실패했습니다. 다시 시도해주세요.',
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        }
      )

      // 스트리밍 완료 후 처리
      console.log('✅ 메시지 전송 완료')
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: fullAIResponse,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setStreamingContent('')
      setIsLoading(false)

      // 메시지 전송 완료 후 세션 목록 갱신 (제목이 업데이트될 수 있음)
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all })
    } catch (error) {
      console.error('❌ 에러 발생:', error)
      setIsLoading(false)
      setStreamingContent('')

      // 에러 메시지 표시
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleExampleClick = (question: string) => {
    setInputValue(question)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <motion.div
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className='flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out'>
      {/* 메시지 영역 */}
      <div className='flex-1 overflow-y-auto px-4 md:px-8 py-6'>
        <AnimatePresence mode='wait'>
          {!hasMessages ? (
            // 초기 화면 - 중앙 배치
            <motion.div
              key='empty-state'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className='h-full flex flex-col items-center justify-center gap-8 max-w-3xl mx-auto'>
              {/* 환영 메시지 */}
              <h1 className='text-2xl md:text-3xl font-semibold text-gray-800 text-center'>안녕, 난 강남대학교 AI 강냉봇이야</h1>

              {/* 입력창 */}
              <div
                className='w-full rounded-4xl p-3 border border-white/30 shadow-xl'
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(23px)',
                  WebkitBackdropFilter: 'blur(23px)',
                }}>
                <div className='flex items-center gap-2 ml-4'>
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='무엇이든 물어보세요'
                    className='flex-1 bg-transparent outline-none resize-none color-[#738199'
                    rows={1}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    aria-label='메시지 전송'
                    className='shrink-0 w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='white'
                      className='w-6 h-6'
                      aria-hidden='true'>
                      <path d='M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z' />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 예시 질문 버튼들 */}
              <div className='flex flex-wrap justify-center gap-3 w-full'>
                {EXAMPLE_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(question)}
                    className='cursor-pointer px-6 py-3 rounded-full border border-white/30 shadow-lg hover:shadow-xl transition-all text-gray-700 text-sm md:text-base'
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(23px)',
                      WebkitBackdropFilter: 'blur(23px)',
                    }}>
                    {question}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            // 메시지 목록
            <motion.div
              key='messages'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='max-w-4xl mx-auto w-full space-y-6'>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {/* AI 프로필 아이콘 */}
                  {message.type === 'ai' && (
                    <div className='shrink-0 w-10 h-10 rounded-full overflow-hidden'>
                      <img
                        src={main_logo}
                        alt='AI Profile'
                        className='w-full h-full object-cover'
                      />
                    </div>
                  )}

                  {/* 메시지 버블 */}
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-lg ${message.type === 'user' ? 'bg-blue-500 text-white' : 'border border-white/30'}`}
                    style={
                      message.type === 'ai'
                        ? {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(23px)',
                            WebkitBackdropFilter: 'blur(23px)',
                          }
                        : undefined
                    }>
                    <p className='text-sm md:text-base whitespace-pre-wrap wrap-break-word'>{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {/* 스트리밍 중인 AI 응답 */}
              {isLoading && streamingContent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='flex gap-3'>
                  <div className='shrink-0 w-10 h-10 rounded-full overflow-hidden'>
                    <img
                      src={main_logo}
                      alt='AI Profile'
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div
                    className='max-w-[70%] px-4 py-3 rounded-2xl shadow-lg border border-white/30'
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(23px)',
                      WebkitBackdropFilter: 'blur(23px)',
                    }}>
                    <p className='text-sm md:text-base whitespace-pre-wrap wrap-break-word'>
                      {streamingContent}
                      <span className='inline-block w-1 h-4 bg-gray-500 ml-1 animate-pulse' />
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 로딩 인디케이터 (스트리밍 시작 전) */}
              {isLoading && !streamingContent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className='flex gap-3'>
                  <div className='shrink-0 w-10 h-10 rounded-full overflow-hidden'>
                    <img
                      src={main_logo}
                      alt='AI Profile'
                      className='w-full h-full object-cover'
                    />
                  </div>
                  <div
                    className='px-4 py-3 rounded-2xl shadow-lg border border-white/30'
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(23px)',
                      WebkitBackdropFilter: 'blur(23px)',
                    }}>
                    <div className='flex gap-1'>
                      <div
                        className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className='w-2 h-2 bg-gray-500 rounded-full animate-bounce'
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 하단 입력창 (메시지가 있을 때만 표시) */}
      {hasMessages && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='border-t border-white/20 p-4 md:p-6'
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(23px)',
            WebkitBackdropFilter: 'blur(23px)',
          }}>
          <div className='max-w-4xl mx-auto'>
            {/* 새 채팅 시작 버튼 */}
            <button
              onClick={() => setCurrentSessionId(undefined)}
              className='w-full mb-3 px-4 py-2.5 bg-white/50 hover:bg-white/70 text-gray-700 rounded-2xl transition-all flex items-center justify-center gap-2 font-medium border border-white/30 shadow-md'>
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
              새 대화 시작하기
            </button>

            <div
              className='w-full rounded-4xl p-3 border border-white/30 shadow-xl'
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(23px)',
                WebkitBackdropFilter: 'blur(23px)',
              }}>
              <div className='flex items-center gap-2 ml-4'>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder='무엇이든 물어보세요'
                  className='flex-1 bg-transparent outline-none resize-none text-gray-800 placeholder-gray-500'
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  aria-label='메시지 전송'
                  className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    inputValue.trim()
                      ? 'bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#4E92FF_0%,_rgba(78,_146,_255,_0.50)_100%)]'
                      : 'bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#B2D0FF_0%,_rgba(178,_208,_255,_0.50)_70%,_rgba(178,_208,_255,_0)_100%)]'
                  }`}>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='white'
                    className='w-6 h-6'
                    aria-hidden='true'>
                    <path d='M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z' />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
