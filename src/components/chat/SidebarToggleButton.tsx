interface SidebarToggleButtonProps {
  isOpen: boolean
  onClick: () => void
  isMobile?: boolean
}

export default function SidebarToggleButton({ isOpen, onClick, isMobile = false }: SidebarToggleButtonProps) {
  if (isMobile) {
    // 모바일 열기 버튼 (고정 위치)
    return (
      <button
        onClick={onClick}
        className='fixed top-4 left-4 z-50 p-3 rounded-full shadow-lg cursor-pointer transition-all hover:scale-110'
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        }}
        aria-label='사이드바 열기'>
        <svg
          className='w-5 h-5 text-main'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M13 5l7 7-7 7M5 5l7 7-7 7'
          />
        </svg>
      </button>
    )
  }

  // 데스크톱 버튼 (사이드바 내부)
  return (
    <button
      onClick={onClick}
      className='p-2 rounded-lg hover:bg-white/50 transition-colors cursor-pointer'
      aria-label={isOpen ? '사이드바 축소' : '사이드바 확대'}>
      <svg
        className='w-5 h-5 text-main'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'>
        {isOpen ? (
          // 닫기 아이콘 (<<)
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M11 19l-7-7 7-7m8 14l-7-7 7-7'
          />
        ) : (
          // 열기 아이콘 (>>)
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M13 5l7 7-7 7M5 5l7 7-7 7'
          />
        )}
      </svg>
    </button>
  )
}
