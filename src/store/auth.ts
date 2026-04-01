import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Auth } from '../lib/api'

interface AuthState {
  userId:       string | null
  token:        string | null
  refreshToken: string | null
  isAuthed:     boolean
  login:        (email: string, password: string) => Promise<void>
  logout:       () => void
  setTokens:    (token: string, refreshToken: string, userId: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId:       null,
      token:        null,
      refreshToken: null,
      isAuthed:     false,

      setTokens: (token, refreshToken, userId) => {
        localStorage.setItem('pik_token',   token)
        localStorage.setItem('pik_refresh', refreshToken)
        set({ token, refreshToken, userId, isAuthed: true })
      },

      login: async (email, password) => {
        const { data } = await Auth.login({ email, password })
        localStorage.setItem('pik_token',   data.token)
        localStorage.setItem('pik_refresh', data.refreshToken)
        set({ token: data.token, refreshToken: data.refreshToken, userId: data.userId, isAuthed: true })
      },

      logout: () => {
        localStorage.removeItem('pik_token')
        localStorage.removeItem('pik_refresh')
        set({ token: null, refreshToken: null, userId: null, isAuthed: false })
      },
    }),
    { name: 'pik-auth', partialize: s => ({ userId: s.userId, token: s.token, refreshToken: s.refreshToken, isAuthed: s.isAuthed }) }
  )
)
