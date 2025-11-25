import { useState } from 'react'
import ProfileModal from '../modal/ProfileModal'
import { useUserStore } from '../../store/useUserStore'
import profile_icon from '../../assets/profile_icon.png'

export default function ProfileSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const user = useUserStore((state) => state.user)

  const userEmail = user?.email || 'hello@gmail.com'
  const userPicture = user?.picture

  return (
    <>

        <button
          onClick={() => setIsModalOpen(true)}
          className='cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-4xl transition-all duration-300 border-gray-100 border'
          style={{
            background: isModalOpen ? 'radial-gradient(circle, rgba(78, 146, 255, 1) 0%, rgba(78, 146, 255, 0.5) 100%)' : 'white',
          }}>
          <div className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0'>
            {userPicture ? (
              <img
                src={userPicture}
                alt='Profile'
                className='w-full h-full object-cover'
              />
            ) : (
              <img
                src={profile_icon}
                alt='Profile Icon'
                className='w-full h-full object-contain'
              />
            )}
          </div>
          <span className={`font-medium text-s truncate transition-colors duration-300 ${isModalOpen ? 'text-white' : 'text-gray-800'}`}>{userEmail}</span>
        </button>


      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={userEmail}
        userPicture={userPicture}
      />
    </>
  )
}
