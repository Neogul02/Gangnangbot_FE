import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  email: string
  name?: string
  picture?: string
}

interface UserStore {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
)
