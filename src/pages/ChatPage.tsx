import { useState } from 'react'
import Background from '../components/Background'
import Sidebar from '../components/chat/Sidebar'
import ChatArea from '../components/chat/ChatArea'

export default function ChatPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className='min-h-screen flex relative'>
      {/* Background - Always in the back */}
      <div className='fixed inset-0 -z-50 lg:-left-[50%] left-0'>
        <Background />
      </div>

      {/* Layout */}
      <div className='flex w-full h-screen overflow-hidden'>
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />

        {/* Main Chat Area */}
        <ChatArea />
      </div>
    </div>
  )
}
