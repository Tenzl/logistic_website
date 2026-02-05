'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'
import { User } from '@/shared/types/dashboard'
import { authService } from '../services/authService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; message?: string }>
  register: (email: string, fullName: string, password: string, phone?: string, company?: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  profileComplete: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = authService.getUser()
    if (storedUser) {
      setUser(storedUser)
    }
    setIsLoading(false)
  }, [])

  const refreshUser = async () => {
    const response = await authService.getCurrentUser()
    if (response.success && response.data) {
      setUser(response.data)
    }
  }

  useEffect(() => {
    if (authService.isAuthenticated()) {
      refreshUser()
    }
  }, [])

  const login = async (email: string, password: string, remember = true) => {
    const response = await authService.login(email, password, remember)
    if (response.success && response.data) {
      setUser(response.data.user)
      return { success: true }
    }
    return { success: false, message: response.message }
  }

  const register = async (email: string, fullName: string, password: string, phone?: string, company?: string) => {
    const response = await authService.register(email, fullName, password, phone, company)
    if (response.success && response.data) {
      setUser(response.data.user)
      return { success: true }
    }
    return { success: false, message: response.message }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    toast.success('Logged out successfully')
  }

  const profileComplete = !!(
    user?.fullName && user?.company && user?.email && user?.phone
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        profileComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
