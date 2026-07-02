import {
  createContext, useContext, useState, useCallback,
  useEffect, type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '@/types'
import { loginApi, registerApi, logoutApi } from '@/lib/api/auth'
import { useToast } from '@/context/ToastContext'
import { storage } from '@/lib/storage'

interface AuthContextValue {
  user:          User | null
  isAuthenticated: boolean
  isLoading:     boolean
  login:         (email: string, password: string) => Promise<void>
  register:      (data: RegisterPayload) => Promise<void>
  logout:        () => void
  updateUser:    (u: Partial<User>) => void
}

export interface RegisterPayload {
  firstName: string
  lastName:  string
  email:     string
  password:  string
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User | null>(() => storage.getUser())
  const [isLoading, setLoading] = useState(false)
  const navigate                = useNavigate()
  const { showToast }           = useToast()

  // Sync user from storage on mount (e.g. after page refresh)
  useEffect(() => {
    const stored = storage.getUser()
    if (stored) setUser(stored)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      const { user: u, token } = await loginApi(email, password)
      storage.setToken(token)
      storage.setUser(u)
      setUser(u)
      showToast(`Welcome back, ${u.name.split(' ')[0]}!`, 'success')
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data ||
        (err instanceof Error ? err.message : 'Login failed')
      showToast(typeof msg === 'string' ? msg : 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }, [navigate, showToast])

  const register = useCallback(async (data: RegisterPayload) => {
    try {
      setLoading(true)
      const { user: u, token } = await registerApi(data)
      storage.setToken(token)
      storage.setUser(u)
      setUser(u)
      showToast('Account created! Welcome to LexIntel AI.', 'success')
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg =
        (err as any)?.response?.data ||
        (err instanceof Error ? err.message : 'Registration failed')
      showToast(typeof msg === 'string' ? msg : 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }, [navigate, showToast])

  const logout = useCallback(() => {
    logoutApi()
    storage.clear()
    setUser(null)
    navigate('/login')
  }, [navigate])

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...partial }
      storage.setUser(updated)
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
