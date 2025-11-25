import { create } from 'zustand'

interface SessionStore {
  currentSessionId: string | undefined
  setCurrentSessionId: (sessionId: string | undefined) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  currentSessionId: undefined,
  setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
}))
