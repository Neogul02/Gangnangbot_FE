import { useEffect, useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listSessions, deleteSession } from '../../services/api/session'
import { motion, AnimatePresence } from 'framer-motion'
import { useSessionStore } from '../../store/useSessionStore'
import DeleteModal from '../modal/DeleteModal'
import type { Session } from '../../services/api/types'

export default function SessionList() {
  const queryClient = useQueryClient()
  const { currentSessionId, setCurrentSessionId } = useSessionStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // React Query를 사용하여 세션 목록 조회
  const {
    data: sessionsData,
    isLoading: loading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await listSessions(false)
      return response.sessions
    },
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  })

  const sessions = sessionsData || []

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 세션 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: async () => {
      // 즉시 refetch하여 최신 데이터 가져오기
      await queryClient.invalidateQueries({ queryKey: ['sessions'] })
      await refetch()
    },
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return '오늘'
    } else if (days === 1) {
      return '어제'
    } else if (days < 7) {
      return `${days}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
      })
    }
  }

  const handleDeleteAll = async () => {
    // 1. 즉시 UI 업데이트 (Optimistic Update)
    const previousSessions = queryClient.getQueryData(['sessions'])
    queryClient.setQueryData(['sessions'], [])
    setCurrentSessionId(undefined)
    setIsMenuOpen(false)

    // 2. 백그라운드에서 API 요청
    try {
      await Promise.all(sessions.map((session) => deleteMutation.mutateAsync(session.sid)))
    } catch (err) {
      console.error('Failed to delete all sessions:', err)
      // 실패 시 이전 상태로 복구
      queryClient.setQueryData(['sessions'], previousSessions)
      alert('세션 삭제에 실패했습니다.')
    }
  }

  const handleDeleteSingle = async (sessionId: string) => {
    // 1. 즉시 UI 업데이트 (Optimistic Update)
    const previousSessions = queryClient.getQueryData(['sessions'])
    queryClient.setQueryData<Session[]>(['sessions'], (old) => {
      if (!old) return old
      return old.filter((session) => session.sid !== sessionId)
    })

    if (currentSessionId === sessionId) {
      setCurrentSessionId(undefined)
    }

    // 2. 백그라운드에서 API 요청
    try {
      await deleteMutation.mutateAsync(sessionId)
    } catch (err) {
      console.error('Failed to delete session:', err)
      // 실패 시 이전 상태로 복구
      queryClient.setQueryData(['sessions'], previousSessions)
      if (currentSessionId === sessionId) {
        setCurrentSessionId(sessionId)
      }
      alert('세션 삭제에 실패했습니다.')
    }
  }

  const openDeleteModal = (sessionId?: string) => {
    if (sessionId) {
      setSessionToDelete(sessionId)
    } else {
      setSessionToDelete(null)
    }
    setIsDeleteModalOpen(true)
    setIsMenuOpen(false)
  }

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      handleDeleteSingle(sessionToDelete)
    } else {
      handleDeleteAll()
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-gray-500'>대화 목록을 불러오는 중이에요...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-full gap-3'>
        <div className='text-red-500 text-sm'>{error instanceof Error ? error.message : '세션 목록을 불러오는데 실패했습니다.'}</div>
        <button
          onClick={() => refetch()}
          className='cursor-pointer px-4 py-2 bg-white text-gray-800 rounded-lg text-sm hover:bg-blue-400 transition'>
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className='flex flex-col h-full overflow-hidden'>
      {/* 헤더 */}
      <div className='relative flex items-center pb-5'>
        <div className='grow border-t border-gray-300'></div>
      </div>
      <div className='flex items-center justify-between mb-4 px-2'>
        <h2 className='text-lg font-semibold text-gray-800'>대화 목록</h2>

        <div className='flex items-center gap-1'>
          <button
            onClick={() => refetch()}
            className='cursor-pointer p-1.5 hover:bg-white/50 rounded-lg transition'
            title='새로고침'
            disabled={isFetching}>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${isFetching ? 'animate-spin' : ''}`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
          </button>

          {/* Menu Button */}
          <div
            className='relative'
            ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='cursor-pointer p-1.5 hover:bg-white/50 rounded-lg transition'
              title='메뉴'>
              <svg
                className='w-5 h-5 text-gray-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className='absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10'>
                  <button
                    onClick={() => openDeleteModal()}
                    className='cursor-pointer w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2'>
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                      />
                    </svg>
                    전체 삭제
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 세션 목록 */}
      <div className='flex-1 overflow-y-auto space-y-2 px-2'>
        {sessions.length === 0 ? (
          <div className='flex items-center justify-center h-full text-gray-500 text-sm'>아직 강냉봇과 나눈 대화가 없어요</div>
        ) : (
          sessions.map((session) => (
            <motion.div
              key={session.sid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='relative group'>
              <button
                onClick={() => setCurrentSessionId(session.sid)}
                className={`cursor-pointer w-full text-left p-3 rounded-lg transition-all ${currentSessionId === session.sid ? 'bg-blue-400 text-white shadow-md' : 'bg-white/50 hover:bg-white/80 text-gray-800'}`}>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex flex-col gap-1 flex-1 min-w-0'>
                    <div className='font-medium line-clamp-2 text-sm'>{session.title}</div>
                    <div className={`text-xs ${currentSessionId === session.sid ? 'text-blue-100' : 'text-gray-500'}`}>{formatDate(session.created_at)}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openDeleteModal(session.sid)
                    }}
                    className={`cursor-pointer p-1 rounded transition ${currentSessionId === session.sid ? 'opacity-100 hover:bg-blue-400' : 'opacity-0 group-hover:opacity-100 hover:bg-gray-200'}`}
                    title='삭제'>
                    <svg
                      className='w-4 h-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                      />
                    </svg>
                  </button>
                </div>
              </button>
            </motion.div>
          ))
        )}
      </div>
      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={sessionToDelete ? '대화 삭제' : '전체 삭제'}
        message={sessionToDelete ? '이 대화를 삭제하시겠습니까?' : '모든 대화를 삭제하시겠습니까?'}
        confirmText='삭제'
        cancelText='취소'
      />
    </div>
  )
}
