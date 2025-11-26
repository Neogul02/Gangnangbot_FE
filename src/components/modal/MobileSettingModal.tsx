import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { saveProfile } from '../../services'
import { useUserStore } from '../../store/useUserStore'

interface MobileSettingModalProps {
  isOpen: boolean
  onClose: () => void
}

// 학과 데이터 구조
const COLLEGE_DATA = {
  공과대학: {
    컴퓨터공학부: ['소프트웨어전공', '메타버스게임전공'],
    인공지능융합공학부: ['인공지능전공', '데이터사이언스전공'],
    전자반도체공학부: ['전자공학전공', '반도체공학전공', '스마트모빌리티전공'],
    부동산건설학부: ['부동산학전공', '스마트도시공학전공', '건축공학전공'],
  },
  예체능대학: {
    디자인학과: ['디자인학과'],
    체육학과: ['체육학과'],
    음악학과: ['음악학과'],
  },
  사범대학: {
    교육학과: ['교육학과'],
    유아교육과: ['유아교육과'],
    초등특수교육과: ['초등특수교육과'],
    중등특수교육과: ['중등특수교육과'],
  },
}

const GRADES = [1, 2, 3, 4]
const SEMESTERS = [1, 2]

export default function MobileSettingModal({ isOpen, onClose }: MobileSettingModalProps) {
  const user = useUserStore((state) => state.user)

  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('')
  const [major, setMajor] = useState('')
  const [grade, setGrade] = useState(1)
  const [semester, setSemester] = useState(1)
  const [isSaving, setIsSaving] = useState(false)

  // 모달이 열릴 때 사용자 정보로 초기화
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '')
    }
  }, [isOpen, user])

  // 단과대학 변경 시 하위 항목 초기화
  const handleCollegeChange = (newCollege: string) => {
    setCollege(newCollege)
    const departments = Object.keys(COLLEGE_DATA[newCollege as keyof typeof COLLEGE_DATA] || {})
    const firstDept = departments[0] || ''
    setDepartment(firstDept)

    const majors = (COLLEGE_DATA as Record<string, Record<string, string[]>>)[newCollege]?.[firstDept] || []
    setMajor(majors[0] || '')
  }

  // 학부 변경 시 전공 초기화
  const handleDepartmentChange = (newDept: string) => {
    setDepartment(newDept)
    const majors = (COLLEGE_DATA as Record<string, Record<string, string[]>>)[college]?.[newDept] || []
    setMajor(majors[0] || '')
  }

  const handleSave = async () => {
    if (!user?.id || !name || !studentId) {
      alert('이름과 학번을 입력해주세요.')
      return
    }

    // 학번 형식 검증 (8자리 숫자)
    if (!/^\d{8}$/.test(studentId)) {
      alert('학번은 8자리 숫자로 입력해주세요. (예: 20251234)')
      return
    }

    setIsSaving(true)
    try {
      await saveProfile({
        user_id: Number(user.id),
        profile_name: name,
        student_id: studentId,
        college,
        department,
        major,
        current_grade: grade,
        current_semester: semester,
      })
      alert('프로필이 저장되었습니다!')
      onClose()
    } catch (error) {
      console.error('프로필 저장 실패:', error)
      alert('프로필 저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  const departments = Object.keys((COLLEGE_DATA as Record<string, Record<string, string[]>>)[college] || {})
  const majors = (COLLEGE_DATA as Record<string, Record<string, string[]>>)[college]?.[department] || []

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/30 backdrop-blur-sm z-9999'
          />

          {/* 모달 - 모바일 전용 (Portal로 body에 렌더링) */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.3 }}
            className='fixed left-0 right-0 bottom-0 z-9999 max-h-[90vh]'>
            <div className='bg-white rounded-t-3xl px-6 py-6 overflow-y-auto max-h-[90vh]'>
              {/* 헤더 */}
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-semibold text-gray-800'>프로필</h2>
                <button
                  onClick={onClose}
                  className='w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors'
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

              {/* 폼 */}
              <div className='space-y-4'>
                {/* 이름 */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>이름</label>
                  <input
                    type='text'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='이름을 입력해주세요'
                    className='w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-base font-medium text-gray-800 placeholder:text-gray-400'
                  />
                </div>

                {/* 학번 */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>학번</label>
                  <input
                    type='text'
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder='학번을 입력해주세요 (ex:20200123)'
                    maxLength={8}
                    className='w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-base font-medium text-gray-800 placeholder:text-gray-400'
                  />
                </div>

                {/* 단과대학 */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>단과대학</label>
                  <div className='relative'>
                    <select
                      value={college}
                      onChange={(e) => handleCollegeChange(e.target.value)}
                      aria-label='단과대학 선택'
                      className={`w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-base font-medium appearance-none cursor-pointer ${college ? 'text-gray-800' : 'text-gray-400'}`}>
                      <option value=''>단과대학을 선택해주세요</option>
                      {Object.keys(COLLEGE_DATA).map((col) => (
                        <option
                          key={col}
                          value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                    <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none'>
                      <svg
                        className='w-5 h-5 text-gray-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 학부 */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>학부</label>
                  <div className='relative'>
                    <select
                      value={department}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      aria-label='학부 선택'
                      disabled={!college}
                      className={`w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-base font-medium appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                        department ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                      <option value=''>학부를 선택해주세요</option>
                      {departments.map((dept) => (
                        <option
                          key={dept}
                          value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none'>
                      <svg
                        className='w-5 h-5 text-gray-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 전공 */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>전공</label>
                  <div className='relative'>
                    <select
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      aria-label='전공 선택'
                      disabled={!department}
                      className={`w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-base font-medium appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                        major ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                      <option value=''>전공을 선택해주세요</option>
                      {majors.map((maj) => (
                        <option
                          key={maj}
                          value={maj}>
                          {maj}
                        </option>
                      ))}
                    </select>
                    <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none'>
                      <svg
                        className='w-5 h-5 text-gray-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 9l-7 7-7-7'
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 현재학기 */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>현재학기</label>
                  <div className='flex gap-3 items-center'>
                    <div className='flex-1 relative'>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(Number(e.target.value))}
                        aria-label='학년 선택'
                        className='w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-base font-medium text-gray-800 appearance-none cursor-pointer pr-10'>
                        {GRADES.map((g) => (
                          <option
                            key={g}
                            value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                      <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                        <svg
                          className='w-4 h-4 text-gray-600'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>
                    </div>
                    <span className='text-base font-semibold text-gray-800'>학년</span>

                    <div className='flex-1 relative'>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(Number(e.target.value))}
                        aria-label='학기 선택'
                        className='w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none text-base font-medium text-gray-800 appearance-none cursor-pointer pr-10'>
                        {SEMESTERS.map((s) => (
                          <option
                            key={s}
                            value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                        <svg
                          className='w-4 h-4 text-gray-600'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 9l-7 7-7-7'
                          />
                        </svg>
                      </div>
                    </div>
                    <span className='text-base font-semibold text-gray-800'>학기</span>
                  </div>
                </div>
              </div>

              {/* 저장 버튼 */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className='w-full mt-6 px-6 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold rounded-full transition-colors disabled:cursor-not-allowed text-base'>
                {isSaving ? '저장 중...' : '저장'}
              </button>

              {/* 안전 영역 (모바일 하단 여백) */}
              <div className='h-4' />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
