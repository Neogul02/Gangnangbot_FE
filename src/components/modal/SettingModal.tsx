import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { saveProfile, getProfile } from '../../services'
import { useUserStore } from '../../store/useUserStore'
import MobileSettingModal from './MobileSettingModal'

interface SettingModalProps {
  isOpen: boolean
  onClose: () => void
}

// 모바일 화면 체크 커스텀 훅
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

// 학과 데이터 구조
const COLLEGE_DATA = {
  자유전공학부: { 자유전공학부: ['자유전공학부'] },
  복지융합대학: { 
    사회복지학부: ['사회복지학전공', '사회서비스학전공', '노인복지전공'], 
    '사회복지학부(야)': ['사회복지학전공(야)'],
    시니어비즈니스학과: ['시니어비즈니스학과']
  },
  경영관리대학:{
    상경학부:['경영학전공','경제금융학전공','국제무역학전공'],
    '상경학부(야)':['경영학전공(야)','경제금융학전공(야)'],
    법행정세무학부:['세무학전공','법행정학전공'],
  },
  글로벌문화콘텐츠대학:{
    문화콘텐츠학과:['문화콘텐츠학과'],
    국제지역학과:['국제지역학과'],
    중국콘텐츠비즈니스학과:['중국콘텐츠비즈니스학과'],
    한국어문학과:['한국어문학과'],
  },
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

export default function SettingModal({ isOpen, onClose }: SettingModalProps) {
  const user = useUserStore((state) => state.user)

  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('')
  const [major, setMajor] = useState('')
  const [grade, setGrade] = useState(1)
  const [semester, setSemester] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 모달이 열릴 때 프로필 로드
  useEffect(() => {
    const loadProfile = async () => {
      if (!isOpen || !user) return

      setIsLoading(true)
      try {
        const profile = await getProfile()

        if (profile) {
          // 저장된 프로필이 있으면 폼에 채우기
          setName(profile.profile_name || user.name || '')
          setStudentId(profile.student_id || '')
          setCollege(profile.college || '')
          setDepartment(profile.department || '')
          setMajor(profile.major || '')
          setGrade(profile.current_grade || 1)
          setSemester(profile.current_semester || 1)
        } else {
          // 프로필이 없으면 기본값 설정
          setName(user.name || '')
          setStudentId('')
          setCollege('')
          setDepartment('')
          setMajor('')
          setGrade(1)
          setSemester(1)
        }
      } catch (error) {
        console.error('프로필 로드 실패:', error)
        // 실패해도 기본값으로 초기화
        setName(user.name || '')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
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

    // 학번 형식 검증 (9자리 숫자)
    if (!/^\d{9}$/.test(studentId)) {
      alert('학번은 9자리 숫자로 입력해주세요. (예: 202512345)')
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

  const isMobile = useIsMobile()

  // 모바일에서는 MobileSettingModal 렌더링
  if (isMobile) {
    return (
      <MobileSettingModal
        isOpen={isOpen}
        onClose={onClose}
      />
    )
  }

  // 데스크톱에서는 기존 모달 렌더링
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
            className='fixed inset-0 bg-black/30 backdrop-blur-sm z-50'
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] max-h-[90vh] z-50'>
            <div
              className='rounded-4xl px-10 py-8 border border-white/30 shadow-[0px_0px_40px_0px_rgba(105,162,255,0.24)] relative overflow-y-auto max-h-[90vh]'
              style={{
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(241, 245, 249, 0.5))',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}>
              {/* 닫기 버튼 */}
              <button
                onClick={onClose}
                className='cursor-pointer absolute top-6 right-6 w-7 h-7 bg-white/50 rounded-full flex items-center justify-center hover:bg-white/70 transition-colors'
                aria-label='닫기'>
                <svg
                  className='w-4 h-4 text-gray-800'
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

              {/* 메인 컨텐츠 영역 */}
              <div className='flex gap-8'>
                {/* 왼쪽: 헤더 */}
                <div className='w-24 shrink-0'>
                  <h2 className='text-2xl font-semibold text-gray-800'>프로필</h2>
                </div>

                {/* 구분선 */}
                <div className='w-0.5 bg-slate-300 shrink-0' />

                {/* 오른쪽: 폼 */}
                <div className='flex-1 space-y-4'>
                  {isLoading && <div className='text-center py-8 text-gray-500'>프로필 로딩 중...</div>}

                  {!isLoading && (
                    <>
                      {/* 이름 */}
                      <div className='flex items-center gap-4'>
                        <label className='w-20 text-lg font-normal text-gray-800 shrink-0'>이름</label>
                        <input
                          type='text'
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder='이름을 입력해주세요'
                          className='w-2/3 px-3 py-3 bg-white/70 rounded-xl border-none focus:outline-none text-lg font-medium text-gray-800 placeholder:text-slate-300'
                        />
                      </div>

                      {/* 학번 */}
                      <div className='flex items-center gap-4'>
                        <label className='w-20 text-lg font-normal text-gray-800 shrink-0'>학번</label>
                        <input
                          type='text'
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder='학번을 입력해주세요 (ex:202512345)'
                          maxLength={9}
                          className='w-2/3 px-3 py-3 bg-white/70 rounded-xl border-none focus:outline-none text-lg font-medium text-gray-800 placeholder:text-slate-300'
                        />
                      </div>

                      {/* 단과대학 */}
                      <div className='flex items-center gap-4'>
                        <label className='w-20 text-lg font-normal text-gray-800 shrink-0'>단과대학</label>
                        <div className='w-2/3 relative'>
                          <select
                            value={college}
                            onChange={(e) => handleCollegeChange(e.target.value)}
                            aria-label='단과대학 선택'
                            className={`w-full px-3 py-3 bg-white/70 rounded-xl border-none focus:outline-none text-lg font-medium appearance-none cursor-pointer ${college ? 'text-gray-800' : 'text-slate-300'}`}>
                            <option value=''>단과대학을 선택해주세요</option>
                            {Object.keys(COLLEGE_DATA).map((col) => (
                              <option
                                key={col}
                                value={col}>
                                {col}
                              </option>
                            ))}
                          </select>
                          <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                            <svg
                              className='w-5 h-5 text-neutral-700'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2.5}
                                d='M19 9l-7 7-7-7'
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* 학부 */}
                      <div className='flex items-center gap-4'>
                        <label className='w-20 text-lg font-normal text-gray-800 shrink-0'>학부</label>
                        <div className='w-2/3 relative'>
                          <select
                            value={department}
                            onChange={(e) => handleDepartmentChange(e.target.value)}
                            aria-label='학부 선택'
                            disabled={!college}
                            className={`w-full px-3 py-3 bg-white/70 rounded-xl border-none focus:outline-none text-lg font-medium appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                              department ? 'text-gray-800' : 'text-slate-300'
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
                          <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                            <svg
                              className='w-5 h-5 text-neutral-700'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2.5}
                                d='M19 9l-7 7-7-7'
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* 전공 */}
                      <div className='flex items-center gap-4'>
                        <label className='w-20 text-lg font-normal text-gray-800 shrink-0'>전공</label>
                        <div className='w-2/3 relative'>
                          <select
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            aria-label='전공 선택'
                            disabled={!department}
                            className={`w-full px-3 py-3 bg-white/70 rounded-xl border-none focus:outline-none text-lg font-medium appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                              major ? 'text-gray-800' : 'text-slate-300'
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
                          <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                            <svg
                              className='w-5 h-5 text-neutral-700'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'>
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2.5}
                                d='M19 9l-7 7-7-7'
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* 현재학기 (학년 + 학기) */}
                      <div className='flex items-center gap-4'>
                        <label className='w-20 text-lg font-normal text-gray-800 shrink-0'>현재학기</label>
                        <div className='flex gap-4 items-center'>
                          <div className='relative shrink-0'>
                            <select
                              value={grade}
                              onChange={(e) => setGrade(Number(e.target.value))}
                              aria-label='학년 선택'
                              className='w-16 px-3 py-3 bg-white/70 rounded-xl border-none focus:outline-none text-lg font-medium text-gray-800 appearance-none cursor-pointer pr-8'>
                              {GRADES.map((g) => (
                                <option
                                  key={g}
                                  value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                            <div className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none'>
                              <svg
                                className='w-4 h-4 text-neutral-700'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2.5}
                                  d='M19 9l-7 7-7-7'
                                />
                              </svg>
                            </div>
                          </div>
                          <span className='text-lg font-semibold text-gray-800'>학년</span>

                          <div className='relative shrink-0'>
                            <select
                              value={semester}
                              onChange={(e) => setSemester(Number(e.target.value))}
                              aria-label='학기 선택'
                              className='w-16 px-3 py-3 bg-white/70 rounded-xl border-none focus:outline-none text-lg font-medium text-gray-800 appearance-none cursor-pointer pr-8'>
                              {SEMESTERS.map((s) => (
                                <option
                                  key={s}
                                  value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <div className='absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none'>
                              <svg
                                className='w-4 h-4 text-neutral-700'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'>
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2.5}
                                  d='M19 9l-7 7-7-7'
                                />
                              </svg>
                            </div>
                          </div>
                          <span className='text-lg font-semibold text-gray-800'>학기</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 저장 버튼 */}
              <div className='flex justify-end mt-6'>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className='cursor-pointer w-24 h-12 bg-white hover:bg-gray-50 disabled:bg-gray-200 rounded-[64px] text-gray-800 text-lg font-semibold transition-colors disabled:cursor-not-allowed'>
                  {isSaving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
